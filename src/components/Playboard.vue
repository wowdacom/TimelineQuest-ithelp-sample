<script setup>
import { ref, reactive, computed } from 'vue';
import { isMobile } from '../utils/device-detect';
import cluesData from '../assets/clues.json';
import clueDefaultPosition from '../assets/clues_position.json';
import axios from 'axios';

const API_URL = 'https://script.google.com/macros/s/AKfycbz9VCrRuZ0pbNB6StnMiRHUOpeZUTu-9c5mSLUGB605WliEp3KlDnmEreKLR7CWH95V/exec';

const postAgeRecord = async (age, record_date) => {
    try {
        const response = await axios.post(API_URL, { age, record_date });
        return response;
    } catch (error) {
        console.error(error);
    }
};

const isGameStart = ref(false);
const isGameEnd = ref(false);
const isShowTip = ref(false);
const isShowHint = ref(false);
const isAnimation = ref(false);
const isPlayed = ref(false);

const timelineEvents = ref([]);
const clues = ref([]);

const initialGameState = {
    currentStep: 1,
    totalStep: 8,
    stepCorrect: [null, null, null, null, null, null, null, null],
    score: 0,
    scoreRecord: [0, 0, 0, 0, 0, 0, 0, 0],
};

const gameStatus = reactive(JSON.parse(JSON.stringify(initialGameState)));

const clueCardContainerEl = ref(null);
const clueCardEl = ref([]);
const currentClueCardEl = ref(null);
const hintEl = ref(null);
const timelineEl = ref(null);
const timelineEventsEl = ref([]);

const currentTimelinePosition = ref([]);

const timelineEventsStyleRawAnimationTarget = ref([
    { transform: 'translate(-50%, 150px)', zIndex: 1 },
    { transform: 'translate(-50%, 150px)', zIndex: 2 },
    { transform: 'translate(-50%, 150px)', zIndex: 3 },
    { transform: 'translate(-50%, 150px)', zIndex: 4 },
    { transform: 'translate(-50%, 150px)', zIndex: 5 },
    { transform: 'translate(-50%, 150px)', zIndex: 6 },
    { transform: 'translate(-50%, 150px)', zIndex: 7 },
    { transform: 'translate(-50%, 150px)', zIndex: 8 },
    { transform: 'translate(-50%, 150px)', zIndex: 9 },
]);

const timelineContainerTop = ref('180px');
const hintPostionTop = ref('80px');

const overOutlineCount = ref(0);

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 100 }, (_, i) => currentYear - i);
const selectedYear = ref(currentYear);

const handleClueCardInteractionStart = (cardIndex, ev, isTouch = false) => {
    ev.preventDefault();
    isShowTip.value = false;
    currentClueCardEl.value = clueCardEl.value[cardIndex];
    document.body.appendChild(currentClueCardEl.value);
    const x = isTouch ? ev.touches[0]?.pageX : ev.pageX;
    const y = isTouch ? ev.touches[0]?.pageY : ev.pageY;
    setCurrentClueCardMove(x, y - currentClueCardEl.value.offsetHeight / 2);

    const moveEvent = isTouch ? 'touchmove' : 'mousemove';
    document.addEventListener(moveEvent, handleClueCardMove);
};

const handleClueCardInteractionEnd = (cardIndex, ev) => {
    ev.preventDefault();
    let isCurrentAnswerCorrect = false;
    if (isShowHint.value) {
        //處理 DOM
        currentClueCardEl.value.remove();
        isShowHint.value = false;

        //處理資料
        timelineEvents.value.splice(overOutlineCount.value, 0, clues.value[cardIndex]);
        clues.value.splice(cardIndex, 1);

        isCurrentAnswerCorrect = handleScore();
        gameStatus.currentStep += 1;

        handleUpdateTimelinePosition(gameStatus.currentStep);

        if (!isCurrentAnswerCorrect) {
            setTimeout(() => {
                handleUpdateTimelineTargetPosition(gameStatus.currentStep);
                isAnimation.value = true;
            }, 0);
        }

        if (gameStatus.currentStep === gameStatus.totalStep + 1) {
            isGameEnd.value = true;
        }
    } else {
        setCurrentClueCardMove(0, 0);
        clueCardContainerEl.value.append(currentClueCardEl.value);
    }
    handleTimelineContainerExtend(false);
    document.removeEventListener('mousemove', handleClueCardMove);
};

const handleAnimationEnd = () => {
    isAnimation.value = false;
    handleSortedTimelineEvents();
};

const handleScore = () => {
    let isCorrect = false;
    let insertPostion = overOutlineCount.value;
    if (insertPostion === 0) {
        isCorrect = timelineEvents.value[insertPostion].year < timelineEvents.value[insertPostion + 1].year;
    } else if (insertPostion === timelineEvents.value.length - 1) {
        isCorrect = timelineEvents.value[insertPostion].year > timelineEvents.value[insertPostion - 1].year;
    } else {
        isCorrect = timelineEvents.value[insertPostion].year > timelineEvents.value[insertPostion - 1].year && timelineEvents.value[insertPostion].year < timelineEvents.value[insertPostion + 1].year;
    }

    gameStatus.stepCorrect[gameStatus.currentStep - 1] = isCorrect;
    if (isCorrect) {
        gameStatus.scoreRecord[gameStatus.currentStep - 1] = timelineEvents.value[insertPostion].point;
        gameStatus.score = getTotalScore();
    }

    //標記 timelineEvents 是否回答正確
    timelineEvents.value[insertPostion].isCorrect = isCorrect;

    return isCorrect;
};

const getTotalScore = () => {
    return gameStatus.scoreRecord.reduce((acc, cur) => acc + cur, 0);
};

const handleSortedTimelineEvents = () => {
    timelineEvents.value.sort((a, b) => a.year - b.year);
    handleUpdateTimelinePosition(gameStatus.currentStep);
};

const handleClueCardMove = (ev) => {
    ev.preventDefault();
    if (isMobile()) {
        setCurrentClueCardMove(ev.touches ? ev.touches[0]?.pageX : ev.pageX, (ev.touches ? ev.touches[0]?.pageY : ev.pageY) - currentClueCardEl.value.offsetHeight / 2);
    } else {
        setCurrentClueCardMove(ev.pageX, ev.pageY - currentClueCardEl.value.offsetHeight / 2);
    }
    handleAnswerProcess();
};

const setCurrentClueCardMove = (left, top) => {
    currentClueCardEl.value.style.left = left + 'px';
    currentClueCardEl.value.style.top = top + 'px';
};

const handleAnswerProcess = () => {
    let hintDefaultTop = 75;
    const currentCardState = currentClueCardEl.value.getBoundingClientRect();
    const timelineElState = timelineEl.value.getBoundingClientRect();
    const timelineEventsElState = timelineEventsEl.value.map((el) => el.getBoundingClientRect());
    const hintHeight = hintEl.value.getBoundingClientRect().height;
    const timelineEventMarginTop = 17;
    const timelineEventHeight = timelineEventsElState[0].height;

    calcTimelineEventCenterLines(timelineEventsElState, currentCardState);

    //處理拖曳時的時間軸拉伸
    if (currentCardState.bottom > timelineElState.top) {
        isShowHint.value = true;
        handleTimelineContainerExtend(true);
    } else {
        isShowHint.value = false;
        handleTimelineContainerExtend(false);
    }

    if (gameStatus.currentStep === 1) {
        if (currentCardState.bottom > timelineEventsElState[0].bottom) {
            hintPostionTop.value = `${hintDefaultTop + hintHeight + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop) + timelineEventMarginTop}px`;
        } else {
            hintPostionTop.value = `${hintDefaultTop}px`;
        }
    }

    if (gameStatus.currentStep === 2) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint

        handleCardMoveAsAnswer(hintHeight, timelineEventMarginTop);
        hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
    }

    if (gameStatus.currentStep === 3) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        hintDefaultTop = -40;

        handleCardMoveAsAnswer(hintHeight, timelineEventMarginTop);
        if (overOutlineCount.value === 0) {
            hintPostionTop.value = `${hintDefaultTop}px`;
        } else {
            hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
        }
    }

    if (gameStatus.currentStep > 3) {
        hintDefaultTop = -40;

        handleCardMoveAsAnswer(hintHeight, timelineEventMarginTop);
        if (overOutlineCount.value === 0) {
            hintPostionTop.value = `${hintDefaultTop}px`;
        } else {
            hintPostionTop.value = `${
                hintDefaultTop + (1 * (hintHeight + timelineEventHeight + timelineEventMarginTop)) / 2 + (overOutlineCount.value - 1) * (timelineEventHeight / 2 + timelineEventMarginTop)
            }px`;
        }
    }
};

const calcTimelineEventCenterLines = (timelineEventsElState, currentCardState) => {
    let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
    overOutlineCount.value = timelineEventCenterLines.reduce((acc, cur) => {
        if (currentCardState.bottom > cur) {
            return acc + 1;
        }
        return acc;
    }, 0);
};

const handleTimelineContainerExtend = (isExtend) => {
    if (isExtend) {
        timelineContainerTop.value = '40px';
    } else {
        timelineContainerTop.value = '180px';
    }
};

const handleCardMoveAsAnswer = (hintHeight, timelineEventMarginTop) => {
    timelineEvents.value.forEach((element, index) => {
        if (index < overOutlineCount.value) {
            timelineEvents.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y - (hintHeight + timelineEventMarginTop)}px)`;
        } else {
            timelineEvents.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
        }
    });
};

const handleUpdateTimelinePosition = (currentStep) => {
    currentTimelinePosition.value = clueDefaultPosition[gameStatus.currentStep - 1];

    if (currentStep > 1) {
        hintPostionTop.value = '75px';
    }
    //updateTimelineEventsPosition
    for (let i = 0; i < currentStep; i++) {
        timelineEvents.value[i].transform = `translate(-50%, ${currentTimelinePosition.value[i]?.y}px)`;
    }
};

const handleUpdateTimelineTargetPosition = () => {
    const sortedTargetLists = [
        ...timelineEvents.value.map((timelineEvent, index) => {
            return {
                ...timelineEvent,
                transform: timelineEvents.value[index].transform,
                zIndex: index + 10,
            };
        }),
    ].sort((a, b) => a.year - b.year);

    sortedTargetLists.forEach((sortedTargetList, index) => {
        timelineEventsStyleRawAnimationTarget.value[index].transform = sortedTargetList.transform;
        timelineEventsStyleRawAnimationTarget.value[index].zIndex = sortedTargetList.zIndex;
    });
};

const handleGameStart = (isRestart) => {
    if (!isRestart) {
        isShowTip.value = true;
    }
    isGameStart.value = true;
    clues.value = [...cluesData];
    timelineEvents.value = [];
    timelineEvents.value.push({
        year: `${selectedYear.value}`,
        event: '一個孩子誕生囉!',
        description: '慶祝生命的多彩多姿，每一刻都值得紀念和珍惜。',
        image: 'https://i.imgur.com/j8skvh5.jpg',
        point: 0,
        step: 0,
    });
    handleUpdateTimelinePosition(gameStatus.currentStep);
    postAgeRecord(selectedYear.value, new Date().toLocaleDateString());
};

const handleGameKeep = () => {
    const savedGameStatus = loadGameStatus();
    isGameStart.value = true;
    isShowTip.value = false;
    Object.assign(gameStatus, savedGameStatus);
    clues.value = savedGameStatus.clues;
    timelineEvents.value = savedGameStatus.timelineEvents;
    selectedYear.value = savedGameStatus.selectedYear;
    handleUpdateTimelinePosition(gameStatus.currentStep);
};

const handleGameReset = () => {
    isGameEnd.value = false;
    isGameStart.value = false;
    Object.assign(gameStatus, JSON.parse(JSON.stringify(initialGameState)));
    handleUpdateTimelinePosition(gameStatus.currentStep);
    isPlayed.value = false;
    localStorage.removeItem('gameStatus');
};

const gameComment = (score) => {
    let comment = '';

    if (score === 0) {
        comment = '似乎你對網頁開發的歷史還不太熟悉。沒問題的，這個遊戲就是讓你第一步了解它。';
    } else if (score >= 1 && score <= 14) {
        comment = '你對網頁開發有基本的了解，但進一步的學習將有助於你更深入地理解這個領域。';
    } else if (score >= 15 && score <= 27) {
        comment = '非常好！你對網頁開發的歷史有著很好的掌握，在這個領域幾乎是專家囉。';
    } else if (score === 28) {
        comment = '完美！你對網頁開發歷史是專家級別! 完全展示了深厚的知識和對這個領域的熱情。';
    }

    return comment;
};

const gameInit = () => {
    const savedGameStatus = loadGameStatus();
    if (savedGameStatus) {
        isPlayed.value = true;
    } else {
        isPlayed.value = false;
    }
};

const loadGameStatus = () => {
    const savedGameStatus = JSON.parse(localStorage.getItem('gameStatus'));
    if (savedGameStatus) {
        return savedGameStatus;
    }
    return null;
};

const boardHeight = computed(() => {
    return {
        height: gameStatus.currentStep > 5 ? (gameStatus.currentStep - 5) * 50 + 667 + 'px' : '667px',
    };
});

const timelineHieght = computed(() => {
    return {
        height: gameStatus.currentStep > 5 ? (gameStatus.currentStep - 5) * 50 + 480 + 'px' : '480px',
    };
});

const saveGameStatus = () => {
    if (gameStatus.currentStep > 1 && gameStatus.currentStep < 9) {
        localStorage.setItem(
            'gameStatus',
            JSON.stringify({
                ...gameStatus,
                clues: clues.value,
                timelineEvents: timelineEvents.value,
                selectedYear: selectedYear.value,
            }),
        );
    } else {
        localStorage.removeItem('gameStatus');
    }

    window.removeEventListener('beforeunload', saveGameStatus);
    return null;
};

window.addEventListener('beforeunload', saveGameStatus);

gameInit();
</script>

<template>
    <div
        v-for="clue in cluesData"
        v-show="!isGameStart"
        :key="clue.year"
        class="animate-[radiation_11s_infinite_forwards] absolute text-[#d8d5ca] text-6xl font-black rotate-0"
        :style="{ 'offset-path': clue.offsetPath, 'animation-delay': clue.animationDelay, 'offset-rotate': '0deg' }"
    >
        {{ clue.year }}
    </div>
    <div :style="boardHeight" class="w-[375px]" :class="isGameStart ? 'border border-light-400 rounded-md' : ''">
        <div class="w-full h-full flex justify-center items-center">
            <div v-if="isGameStart" class="w-full h-full relative">
                <div class="mx-1 h-8 flex justify-center items-center relative">
                    <div class="mr-2 text-sm font-Libre">{{ gameStatus.currentStep < gameStatus.totalStep + 1 ? gameStatus.currentStep : gameStatus.totalStep }} / {{ gameStatus.totalStep }} 題</div>
                    <ul class="flex items-center">
                        <li
                            v-for="(isCorrect, index) in gameStatus.stepCorrect"
                            :key="index"
                            class="w-6 h-2.5 mr-[2px] border-2 rounded-full"
                            :class="
                                gameStatus.currentStep === index + 1
                                    ? 'border-[#5d72c9]'
                                    : isCorrect === null
                                    ? 'bg-[#e3e0d5] border-[#e3e0d5]'
                                    : isCorrect
                                    ? 'bg-[#5cb887] border-[#5cb887]'
                                    : 'bg-[#d25353] border-[#d25353]'
                            "
                        />
                    </ul>
                    <div data-test="score" class="ml-2 text-sm font-Libre">{{ gameStatus.score }} 分</div>
                    <RuleDeclaration class="z-50 ml-2" />
                </div>
                <div v-if="!isGameEnd" ref="clueCardContainerEl" class="absolute h-[145px] left-1/2 top-8 z-10">
                    <div
                        v-for="(clue, index) in clues"
                        v-show="clue.step === gameStatus.currentStep"
                        ref="clueCardEl"
                        :key="clue"
                        :data-test="clue.step === gameStatus.currentStep ? 'clue-card' : 'clue-card-hidden'"
                        class="cursor-grabbing absolute top-0 left-1/2 -translate-x-1/2 flex items-center w-[360px] px-2 py-3 border rounded-lg mx-auto bg-white shadow-bottom"
                        :class="isShowTip ? 'animate-[wiggleCard_5s_infinite_forwards]' : ''"
                        @mousedown.stop="handleClueCardInteractionStart(index, $event, false)"
                        @touchstart.stop="handleClueCardInteractionStart(index, $event, true)"
                        @mouseup.stop="handleClueCardInteractionEnd(index, $event)"
                        @touchend.stop="handleClueCardInteractionEnd(index, $event)"
                        @dragstart="() => false"
                    >
                        <img class="w-[100px] h-[100px] mr-2 shrink-0 object-contain bg-white" :src="clue.image" alt="" />
                        <p class="text-sm font-bold">
                            {{ clue.description }}
                        </p>
                        <div class="absolute right-2 bottom-2 font-Libre text-[#b1aea4] text-sm">{{ clue.point }} 分</div>
                    </div>
                    <div v-if="isShowTip" class="absolute bottom-10 left-10 translate-x-1/2 translate-y-10">
                        <i-carbon-touch-1-filled class="animate-[wiggle_5s_infinite_forwards] text-4xl text-yellow-400" />
                        <div class="absolute w-60 -bottom-10 -left-20 -rotate-3 font-bold">將線索拖曳到時間軌跡上！</div>
                    </div>
                </div>
                <div v-else class="absolute h-[145px] w-full top-8 z-10 flex flex-col p-4 bg-gray-500 text-white rounded-lg">
                    <div class="text-2xl font-bold">遊戲結束</div>
                    <div class="mt-1">
                        {{ gameComment(gameStatus.score) }}
                    </div>
                    <div class="mt-1">
                        你共答對
                        {{ gameStatus.stepCorrect.filter((item) => item).length }} 題 / 得分 {{ gameStatus.score }} 分
                    </div>

                    <i-majesticons-lightbulb-shine class="absolute top-4 right-10 rotate-180 text-yellow-300 text-4xl" />
                    <div class="cursor-pointer absolute right-0 bottom-0 text-white flex p-3 text-3xl items-center">
                        <i-solar-restart-square-bold class="mr-3" @click="handleGameReset" />
                        <a target="_blank" href="https://social-plugins.line.me/lineit/share?url=https://wowdacom.github.io/TimelineQuest-ithelp-sample/"> <i-ph-share-fill class="mr-3" /></a>
                    </div>
                </div>

                <div ref="timelineContainerEl" class="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-full px-4">
                    <div :style="{ paddingTop: timelineContainerTop }" class="transition-all duration-700 relative h-full flex flex-col items-center z-0">
                        <div class="text-[#b1aea4]">BEFORE</div>
                        <div class="w-0.5 h-full bg-white" />
                        <div class="text-[#b1aea4] mb-4">AFTER</div>
                    </div>

                    <div ref="timelineEl" data-test="timeline" :style="timelineHieght" class="absolute w-full bottom-0 left-1/2 -translate-x-1/2">
                        <div
                            v-show="isShowHint"
                            ref="hintEl"
                            :style="{ top: hintPostionTop }"
                            class="w-[360px] h-[120px] bg-[#f9d988] rounded-lg absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                        <div
                            v-for="(timelineEvent, index) in timelineEvents"
                            ref="timelineEventsEl"
                            :key="timelineEvent.year"
                            class="mx-auto absolute top-0 left-1/2 w-[350px] bg-[#e3e0d5] rounded-lg py-[12px] px-[10px] flex items-center border-t-4 border-t-[#f2f1e7]"
                            :class="isAnimation ? 'transition-transform duration-500' : ''"
                            :style="isAnimation ? timelineEventsStyleRawAnimationTarget[index] : { transform: timelineEvent.transform }"
                            @transitionend="handleAnimationEnd"
                        >
                            <div class="absolute left-1/2 top-0 -translate-x-1/2 translate-y-[-18px] bg-[#f2f1e7] rounded-t-full text-base px-3.5 z-3 text-[#f2f1e7] h-4">
                                {{ timelineEvent.year }}
                                <!-- 我是橢圓形的邊框 -->
                            </div>
                            <div
                                :class="
                                    timelineEvent.isCorrect === undefined
                                        ? 'bg-[#b6b3a4] border-[#e3e0d5]'
                                        : timelineEvent.isCorrect
                                        ? 'bg-[#5cb887] border-[#5cb887]'
                                        : 'bg-[#d25353] border-[#d25353]'
                                "
                                :data-test="timelineEvent.isCorrect === undefined ? 'default' : timelineEvent.isCorrect ? 'timeline-event-year-correct' : 'timeline-event-year-wrong'"
                                class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full text-base px-2 py-0.5 text-white font-Libre"
                            >
                                {{ timelineEvent.year }}
                            </div>
                            <img class="w-[65px] h-[65px] shrink-0 object-contain bg-white" :src="timelineEvent.image" alt="" />
                            <p class="px-2 text-sm text-[#5b5338] font-extrabold line-clamp-3">
                                {{ timelineEvent.description }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="w-[350px] h-[350px] rounded-2xl border-2 flex flex-col justify-center items-center relative bg-white shadow-md">
                <RuleDeclaration class="absolute top-2 right-2" />
                <i-clarity-beta-solid class="text-5xl text-[#5D72C8] opacity-30" />
                <h1 data-test="title" class="text-4xl font-extrabold mb-3">時間線任務</h1>
                <h4 class="mb-5 text-[#b1aea4]">2023年9月1日</h4>
                <h2 class="mb-2 text-center">你能把八個重要事件<br />按自己出生前後順序排列嗎？</h2>

                <div v-if="isPlayed">
                    <div class="text-center font-extrabold m-1 text-[#5d72c9]">
                        <span class="">{{ selectedYear }} </span>那年出生的你，選擇要…
                    </div>
                    <div class="flex">
                        <button data-test="game-start-btn" class="rounded-full border w-[130px] h-[40px] bg-[#5d72c9] text-white flex justify-center items-center" @click="handleGameStart(true)">
                            重新開始 <i-solar-restart-square-bold class="ml-1 inline-block" />
                        </button>
                        <button data-test="game-start-btn" class="rounded-full border w-[130px] h-[40px] bg-[#5d72c9] text-white flex justify-center items-center" @click="handleGameKeep">
                            繼續遊戲 <i-maki-arrow class="ml-1 inline-block" />
                        </button>
                    </div>
                </div>
                <div v-else>
                    <div class="mb-2 flex">
                        <h1>選擇出生年份</h1>
                        <select v-model="selectedYear" class="text-[#5d72c9] font-extrabold">
                            <option v-for="year in yearOptions" :key="year" :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </div>
                    <button data-test="game-start-btn" class="rounded-full border w-[150px] h-[40px] bg-[#5d72c9] text-white" @click="handleGameStart(false)">
                        開始遊戲 <i-maki-arrow class="inline-block" />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@700&display=swap');
.list-enter-active,
.list-leave-active {
    transition: all 1s ease;
}
.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateX(30px);
}
</style>

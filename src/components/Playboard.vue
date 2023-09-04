<script setup>
import { ref, reactive, computed } from 'vue';
import { isMobile } from '../utils/device-detect';
import cluesData from '../assets/clues.json';
import clueDefaultPosition from '../assets/clues_position.json';

const isGameStart = ref(false);
const isGameEnd = ref(false);
const isShowTip = ref(false);
const isShowInstructions = ref(false);
const isShowHint = ref(false);
const isAnimation = ref(false);

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

const currentTimelinePosition = ref([
    {
        x: '50%',
        y: 40,
    },
    {
        x: '50%',
        y: 100,
    },
    {
        x: '50%',
        y: 160,
    },
    {
        x: '50%',
        y: 220,
    },
    {
        x: '50%',
        y: 280,
    },
    {
        x: '50%',
        y: 340,
    },
    {
        x: '50%',
        y: 400,
    },
    {
        x: '50%',
        y: 460,
    },
    {
        x: '50%',
        y: 520,
    },
]);

const timelineEventsStyleRaw = ref([
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
    {
        transform: 'translate(-50%, 150px)',
    },
]);

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

const handleClueCardClick = (cardIndex, ev) => {
    if (isMobile()) {
        return;
    }
    isShowTip.value = false;
    currentClueCardEl.value = clueCardEl.value[cardIndex];
    document.body.appendChild(currentClueCardEl.value);
    setCurrentClueCardMove(ev.pageX, ev.pageY - currentClueCardEl.value.offsetHeight / 2);

    document.addEventListener('mousemove', handleClueCardMove);
};

const handleClueCardTouch = (cardIndex, ev) => {
    isShowTip.value = false;
    currentClueCardEl.value = clueCardEl.value[cardIndex];
    document.body.append(currentClueCardEl.value);
    setCurrentClueCardMove(ev.touches[0].pageX, ev.touches[0].pageY - currentClueCardEl.value.offsetHeight / 2);

    document.addEventListener('touchmove', handleClueCardMove);
};

const handleClueCardClickOff = (cardIndex) => {
    if (isMobile()) {
        return;
    }
    clueCardContainerEl.value.append(currentClueCardEl.value);
    setCurrentClueCardMove(0, 0);
    if (isShowHint.value) {
        isShowHint.value = false;

        timelineEvents.value.splice(overOutlineCount.value, 0, clues.value[cardIndex]);

        clues.value.splice(cardIndex, 1);
        handleScore();
        timelineEvents.value.sort((a, b) => a.year - b.year);
        if (gameStatus.currentStep < gameStatus.totalStep) {
            gameStatus.currentStep += 1;
        } else {
            isGameEnd.value = true;
        }
    }

    handleTimelineContainerExtend(false);
    timelineEventsStyleRaw.value.forEach((element, index) => {
        timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
    });
};

const handleClueCardTouchOff = async (cardIndex) => {
    let isCurrentAnswerCorrect = false;
    if (isShowHint.value) {
        //處理 DOM
        currentClueCardEl.value.remove();
        isShowHint.value = false;

        //處理資料
        timelineEvents.value.splice(overOutlineCount.value, 0, clues.value[cardIndex]);
        clues.value.splice(cardIndex, 1);

        isCurrentAnswerCorrect = handleScore();

        if (gameStatus.currentStep < gameStatus.totalStep) {
            gameStatus.currentStep += 1;
        } else {
            resetTimelineEventsPosition();
            isGameEnd.value = true;
        }

        handleUpdateTimelinePosition(gameStatus.currentStep);

        if (!isCurrentAnswerCorrect) {
            setTimeout(() => {
                handleUpdateTimelineTargetPosition(gameStatus.currentStep);
                isAnimation.value = true;
            }, 500);
        }
    } else {
        setCurrentClueCardMove(0, 0);
        clueCardContainerEl.value.append(currentClueCardEl.value);
    }
    handleTimelineContainerExtend(false);
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
        gameStatus.score += timelineEvents.value[insertPostion].point;
    }

    //標記 timelineEvents 是否回答正確
    timelineEvents.value[insertPostion].isCorrect = isCorrect;

    return isCorrect;
};

const handleSortedTimelineEvents = () => {
    timelineEvents.value.sort((a, b) => a.year - b.year);
};

const handleClueCardMove = (ev) => {
    if (isMobile()) {
        setCurrentClueCardMove(ev.touches[0].pageX, ev.touches[0].pageY - currentClueCardEl.value.offsetHeight / 2);
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

        calcTimelineEventsCurrentStyles(hintHeight, timelineEventMarginTop);
        hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
    }

    if (gameStatus.currentStep === 3) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        hintDefaultTop = -40;

        calcTimelineEventsCurrentStyles(hintHeight, timelineEventMarginTop);
        if (overOutlineCount.value === 0) {
            hintPostionTop.value = `${hintDefaultTop}px`;
        } else {
            hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
        }
    }

    if (gameStatus.currentStep > 3) {
        hintDefaultTop = -40;

        calcTimelineEventsCurrentStyles(hintHeight, timelineEventMarginTop);
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

const calcTimelineEventsCurrentStyles = (hintHeight, timelineEventMarginTop) => {
    timelineEventsStyleRaw.value.forEach((element, index) => {
        if (index < overOutlineCount.value) {
            timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y - (hintHeight + timelineEventMarginTop)}px)`;
        } else {
            timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
        }
    });
};

const resetTimelineEventsPosition = (currentStep) => {
    timelineEventsStyleRaw.value.forEach((element, index) => {
        timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
    });
};

const handleUpdateTimelinePosition = (currentStep) => {
    // 更新 timelineEvents 的位置
    const updateTimelineEventsPosition = (currentStep, timelineEvents, timelinePositions) => {
        for (let i = 0; i < currentStep; i++) {
            timelineEvents[i].transform = `translate(-50%, ${timelinePositions[i]?.y}px)`;
        }
    };

    currentTimelinePosition.value = clueDefaultPosition[gameStatus.currentStep - 1];
    switch (currentStep) {
        case 1:
            timelineEventsStyleRaw.value[0].transform = 'translate(-50%, 160px)';
            break;
        case 2:
            hintPostionTop.value = '75px';
            updateTimelineEventsPosition(currentStep, timelineEventsStyleRaw.value, currentTimelinePosition.value);
            break;
        default:
            if (currentStep >= 3) {
                hintPostionTop.value = '75px';
                updateTimelineEventsPosition(currentStep, timelineEventsStyleRaw.value, currentTimelinePosition.value);
            }
            break;
    }
};

const handleUpdateTimelineTargetPosition = () => {
    let insertPostion = overOutlineCount.value;
    const sortedTargetLists = [
        ...timelineEvents.value.map((timelineEvent, index) => {
            return {
                ...timelineEvent,
                transform: timelineEventsStyleRaw.value[index].transform,
                zIndex: index + 10,
            };
        }),
    ].sort((a, b) => a.year - b.year);

    sortedTargetLists.forEach((sortedTargetList, index) => {
        timelineEventsStyleRawAnimationTarget.value[index].transform = sortedTargetList.transform;
        timelineEventsStyleRawAnimationTarget.value[index].zIndex = sortedTargetList.zIndex;
    });
};

const handleGameStart = () => {
    isGameStart.value = true;
    isShowTip.value = true;
};

const handleGameReset = () => {
    isGameEnd.value = false;
    isGameStart.value = false;
    timelineEvents.value = [];
    timelineEvents.value.push({
        year: '2023',
        event: '2023 iThome鐵人賽',
        description: '在開賽期間，選擇一天開賽，並且達成連續 30 天發表技術文章不中斷，即煉成鐵人完賽。',
        image: 'https://ithelp.ithome.com.tw/static/2021ironman/images/logo/ithelp.png',
        translateY: '300px',
        point: 0,
        step: 0,
    });
    clues.value = [...cluesData];
    Object.assign(gameStatus, JSON.parse(JSON.stringify(initialGameState)));
    currentTimelinePosition.value = clueDefaultPosition[gameStatus.currentStep - 1];
    handleUpdateTimelinePosition(gameStatus.currentStep);
};

const handleShowInstructions = () => {
    isShowInstructions.value = !isShowInstructions.value;
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
    timelineEvents.value.push({
        year: '2023',
        event: '2023 iThome鐵人賽',
        description: '在開賽期間，選擇一天開賽，並且達成連續 30 天發表技術文章不中斷，即煉成鐵人完賽。',
        image: 'https://ithelp.ithome.com.tw/static/2021ironman/images/logo/ithelp.png',
        translateY: '300px',
        point: 0,
        step: 0,
    });

    clues.value = [...cluesData];

    currentTimelinePosition.value = clueDefaultPosition[gameStatus.currentStep - 1];
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

gameInit();
</script>

<template>
    <div :style="boardHeight" class="w-[375px] border border-light-400">
        <div class="w-full h-full flex justify-center items-center">
            <div class="w-full h-full relative" v-if="isGameStart">
                <div class="mx-1 h-8 flex justify-center items-center relative">
                    <div class="mr-2 text-sm font-Libre">{{ gameStatus.currentStep }} / {{ gameStatus.totalStep }} 題</div>
                    <ul class="flex items-center">
                        <li
                            class="w-6 h-2.5 mr-[2px] border-2 rounded-full"
                            :class="[
                                isCorrect === null ? 'bg-[#e3e0d5] border-[#e3e0d5]' : isCorrect ? 'bg-[#5cb887] border-[#5cb887]' : 'bg-[#d25353] border-[#d25353]',
                                gameStatus.currentStep === index + 1 ? 'border-[#5d72c9]' : '',
                            ]"
                            v-for="(isCorrect, index) in gameStatus.stepCorrect"
                        ></li>
                    </ul>
                    <div class="ml-2 text-sm font-Libre">{{ gameStatus.score }} 分</div>
                    <div @click="handleShowInstructions" class="z-50 ml-2 w-5 h-5 mt-0.5 flex justify-center items-center border-2 border-[#b1aea4] text-[#b1aea4] rounded-full">
                        <i-healthicons-question-mark class="text-sm" />
                    </div>
                </div>
                <div v-if="!isGameEnd" ref="clueCardContainerEl" class="absolute h-[145px] left-1/2 top-8 z-10">
                    <div
                        ref="clueCardEl"
                        v-for="(clue, index) in clues"
                        :key="clue"
                        class="cursor-grabbing absolute top-0 left-1/2 -translate-x-1/2 flex items-center w-[360px] px-2 py-3 border rounded-lg mx-auto bg-white shadow-bottom"
                        :class="isShowTip ? 'animate-[wiggleCard_5s_infinite_forwards]' : ''"
                        v-show="clue.step === gameStatus.currentStep"
                        @mousedown.stop="handleClueCardClick(index, $event)"
                        @mouseup.stop="handleClueCardClickOff(index)"
                        @touchstart.stop="handleClueCardTouch(index, $event)"
                        @touchend.stop="handleClueCardTouchOff(index)"
                        @dragstart="() => false"
                    >
                        <img class="w-[100px] h-[100px] mr-2 shrink-0 object-contain bg-white" :src="clue.image" alt="" />
                        <p class="text-sm font-bold">{{ clue.description }}</p>
                        <div class="absolute right-2 bottom-2 font-Libre text-[#b1aea4] text-sm">{{ clue.point }} 分</div>
                    </div>
                    <div class="absolute bottom-10 left-10 translate-x-1/2 translate-y-10" v-if="isShowTip">
                        <i-carbon-touch-1-filled class="animate-[wiggle_5s_infinite_forwards] text-4xl text-yellow-400" />
                        <div class="absolute w-60 -bottom-10 -left-20 -rotate-3 font-bold">將線索拖曳到時間軌跡上！</div>
                    </div>
                </div>
                <div v-else class="absolute h-[145px] w-full top-8 z-10 flex flex-col p-4 bg-gray-500 text-white rounded-lg">
                    <div class="text-2xl font-bold">遊戲結束</div>
                    <div class="mt-1">{{ gameComment(gameStatus.score) }}</div>
                    <div class="mt-1">你共答對 {{ gameStatus.stepCorrect.filter((item) => item).length }} 題 / 得分 {{ gameStatus.score }} 分</div>

                    <i-majesticons-lightbulb-shine class="absolute top-4 right-10 rotate-180 text-yellow-300 text-4xl"></i-majesticons-lightbulb-shine>
                    <div class="absolute right-0 bottom-0 text-white flex p-3 text-3xl items-center">
                        <i-solar-restart-square-bold @click="handleGameReset" class="mr-3"></i-solar-restart-square-bold>
                        <a target="_blank" href="https://social-plugins.line.me/lineit/share?url=https://wowdacom.github.io/TimelineQuest-ithelp-sample/">
                            <i-ph-share-fill @click="handleLineShare" class="mr-3"></i-ph-share-fill
                        ></a>
                    </div>
                </div>

                <div ref="timelineContainerEl" class="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-full px-4">
                    <div :style="{ paddingTop: timelineContainerTop }" class="transition-all duration-700 relative h-full flex flex-col items-center z-0">
                        <div ref="anchorBeforeEl" class="text-[#b1aea4]">BEFORE</div>
                        <div class="w-0.5 h-full bg-white"></div>
                        <div class="text-[#b1aea4] mb-4">AFTER</div>
                    </div>

                    <div ref="timelineEl" :style="timelineHieght" class="absolute w-full bottom-0 left-1/2 -translate-x-1/2">
                        <div
                            ref="hintEl"
                            :style="{ top: hintPostionTop }"
                            v-show="isShowHint"
                            class="w-[360px] h-[120px] bg-[#f9d988] rounded-lg absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                        ></div>
                        <div
                            ref="timelineEventsEl"
                            v-for="(timelineEvent, index) in timelineEvents"
                            :key="timelineEvent.year"
                            class="mx-auto absolute top-0 left-1/2 w-[350px] bg-[#e3e0d5] rounded-lg py-[12px] px-[10px] flex items-center border-t-4 border-t-[#f2f1e7]"
                            :class="isAnimation ? 'transition-transform duration-500' : ''"
                            :style="isAnimation ? timelineEventsStyleRawAnimationTarget[index] : timelineEventsStyleRaw[index]"
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
                                class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full text-base px-2 py-0.5 text-white font-Libre"
                            >
                                {{ timelineEvent.year }}
                            </div>
                            <img class="w-[65px] h-[65px] shrink-0 object-contain bg-white" :src="timelineEvent.image" alt="" />
                            <p class="px-2 text-sm text-[#5b5338] font-extrabold line-clamp-3">{{ timelineEvent.description }}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div v-else class="w-[350px] h-[350px] rounded-2xl border-2 flex flex-col justify-center items-center relative bg-white shadow-md">
                <div @click="handleShowInstructions" class="h-5 absolute top-2 right-2 border-2 border-[#b1aea4] text-[#b1aea4] rounded-full">
                    <i-healthicons-question-mark class="text-sm" />
                </div>
                <i-clarity-beta-solid class="text-5xl text-[#5D72C8] opacity-30" />
                <h1 class="text-4xl font-extrabold mb-3">時間線任務</h1>
                <h4 class="mb-5 text-[#b1aea4]">2023年9月1日</h4>
                <h2 class="mb-2 text-center">你能把八個重要事件<br />按照時間順序排列嗎？</h2>
                <button @click="handleGameStart" class="rounded-full border w-[150px] h-[40px] bg-[#5d72c9] text-white">開始遊戲 <i-maki-arrow class="inline-block" /></button>
            </div>
        </div>

        <Teleport to="body">
            <div v-if="isShowInstructions" class="mx-auto w-11/12 px-4 py-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg z-20">
                <i-iconoir-cancel @click="handleShowInstructions" class="absolute right-2 top-2 text-xl" />
                <h1 class="text-2xl font-bold mb-6 text-center">怎麼玩時間線任務</h1>
                <div class="">
                    <p class="mb-2">將每張線索卡按照時間順序放置在時間軌跡上：</p>
                    <div class="flex mb-4">
                        <ol class="list-decimal pl-4 mb-4">
                            <li class="mb-2">將線索拖曳至其他事件之間、之前或之後。</li>
                            <li class="mb-2">將卡片從最早（頂部）排列至最晚（底部）。</li>
                            <li class="mb-2">按下「點擊以放置」以確認位置。</li>
                        </ol>
                        <video
                            id="how-to-animation"
                            width="118"
                            height="159"
                            src="https://static01.nytimes.com/newsgraphics/2023-01-05-headlines/dbee7ea268717ea6be65b1bd8bbbb1a46bdf16b8/_assets/images/HowToAnimation-03-low.mp4"
                            autoplay
                            loop
                            playsinline
                            preload
                            class="svelte-1jnn636"
                        >
                            <img
                                src="https://static01.nytimes.com/newsgraphics/2023-01-05-headlines/dbee7ea268717ea6be65b1bd8bbbb1a46bdf16b8/_assets/images/HowToAnimation-03.jpg"
                                title="Your browser does not support the <video> tag"
                                alt="A short animation showing a card being dragged onto a timeline."
                            />
                        </video>
                    </div>
                    <p class="mb-2">錯誤的線索將在每回合移至正確的位置。正確的線索可獲得2至5分。完美分數為28分。</p>
                    <p>編輯根據時報的報導選擇線索。每一份被推動的社會進步將會有一個新的問答遊戲。</p>
                </div>
            </div>
        </Teleport>
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
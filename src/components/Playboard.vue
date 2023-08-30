<script setup>
import { ref, reactive, watch } from 'vue';
import { isMobile } from '../utils/device-detect';
import cluesData from '../assets/clues.json';
import clueDefaultPosition from '../assets/clues_position.json';

const isGameStart = ref(false);
const isGameEnd = ref(false);
const isShowTip = ref(false);
const isShowInstructions = ref(false);
const isShowHint = ref(false);

const timelineEvents = ref([]);
const clues = ref([]);

const gameStatus = reactive({
    currentStep: 1,
    totalStep: 8,
    stepCorrect: [null, null, null, null, null, null, null, null],
    score: 0,
    scoreRecord: [0, 0, 0, 0, 0, 0, 0, 0],
});

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

    timelineContainerTop.value = '180px';
    timelineEventsStyleRaw.value.forEach((element, index) => {
        timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
    });
};

const handleClueCardTouchOff = (cardIndex) => {
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

    timelineContainerTop.value = '180px';
    timelineEventsStyleRaw.value.forEach((element, index) => {
        timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
    });
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
    const currentCardState = currentClueCardEl.value.getBoundingClientRect();
    const timelineElState = timelineEl.value.getBoundingClientRect();
    const timelineEventsElState = timelineEventsEl.value.map((el) => el.getBoundingClientRect());
    let hintDefaultTop = 75;
    const hintHeight = hintEl.value.getBoundingClientRect().height;
    const timelineEventMarginTop = 17;
    const timelineEventHeight = timelineEventsElState[0].height;

    //處理拖曳時的時間軸拉伸
    if (currentCardState.bottom > timelineElState.top) {
        isShowHint.value = true;
        timelineContainerTop.value = '40px';
    } else {
        isShowHint.value = false;
        timelineContainerTop.value = '180px';
    }

    if (gameStatus.currentStep === 1) {
        if (currentCardState.bottom > timelineEventsElState[0].bottom) {
            overOutlineCount.value = 1;
            hintPostionTop.value = `${hintDefaultTop + hintHeight + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop) + timelineEventMarginTop}px`;
        } else {
            hintPostionTop.value = `${hintDefaultTop}px`;
            overOutlineCount.value = 0;
        }
    }

    if (gameStatus.currentStep === 2) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
        overOutlineCount.value = timelineEventCenterLines.reduce((acc, cur) => {
            if (currentCardState.bottom > cur) {
                return acc + 1;
            }
            return acc;
        }, 0);
        timelineEventsStyleRaw.value.forEach((element, index) => {
            if (index < overOutlineCount.value) {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y - (hintHeight + timelineEventMarginTop)}px)`;
            } else {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
            }
        });

        hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
    }

    if (gameStatus.currentStep === 3) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        hintDefaultTop = -40;
        let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
        overOutlineCount.value = timelineEventCenterLines.reduce((acc, cur) => {
            if (currentCardState.bottom > cur) {
                return acc + 1;
            }
            return acc;
        }, 0);

        timelineEventsStyleRaw.value.forEach((element, index) => {
            if (index < overOutlineCount.value) {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y - (hintHeight + timelineEventMarginTop)}px)`;
            } else {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
            }
        });
        if (overOutlineCount.value === 0) {
            hintPostionTop.value = `${hintDefaultTop}px`;
        } else {
            hintPostionTop.value = `${hintDefaultTop + overOutlineCount.value * (timelineEventHeight + timelineEventMarginTop)}px`;
        }
    }

    if (gameStatus.currentStep > 3) {
        hintDefaultTop = -40;
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
        overOutlineCount.value = timelineEventCenterLines.reduce((acc, cur) => {
            if (currentCardState.bottom > cur) {
                return acc + 1;
            }
            return acc;
        }, 0);

        timelineEventsStyleRaw.value.forEach((element, index) => {
            if (index < overOutlineCount.value) {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y - (hintHeight + timelineEventMarginTop)}px)`;
            } else {
                timelineEventsStyleRaw.value[index].transform = `translate(-50%, ${currentTimelinePosition.value[index]?.y}px)`;
            }
        });

        if (overOutlineCount.value === 0) {
            hintPostionTop.value = `${hintDefaultTop}px`;
        } else {
            hintPostionTop.value = `${
                hintDefaultTop + (1 * (hintHeight + timelineEventHeight + timelineEventMarginTop)) / 2 + (overOutlineCount.value - 1) * (timelineEventHeight / 2 + timelineEventMarginTop)
            }px`;
        }
    }
};

watch(
    () => gameStatus.currentStep,
    (currentStep) => {
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
    },
);

const handleGameStart = () => {
    isGameStart.value = true;
    isShowTip.value = true;
};

const handleShowInstructions = () => {
    isShowInstructions.value = !isShowInstructions.value;
};

const gameInit = () => {
    timelineEvents.value.push({
        year: '2023',
        event: '2023 iThome鐵人賽',
        description: '在開賽期間，選擇一天開賽，並且達成連續 30 天發表技術文章不中斷，即煉成鐵人完賽。',
        image: 'https://picsum.photos/100/100?random=17',
        translateY: '300px',
        point: 0,
        step: 0,
    });

    clues.value = [...cluesData];

    currentTimelinePosition.value = clueDefaultPosition[gameStatus.currentStep - 1];
};
gameInit();
</script>

<template>
    <div class="w-[375px] h-[667px] border border-light-400">
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
                        <img class="w-[100px] h-[100px] mr-2 shrink-0" :src="clue.image" alt="" />
                        <p class="text-sm font-bold">{{ clue.year + ' ' + clue.description }}</p>
                        <div class="absolute right-2 bottom-2 font-Libre text-[#b1aea4] text-sm">{{ clue.point }} 分</div>
                    </div>
                    <div class="absolute bottom-10 left-10 translate-x-1/2 translate-y-10" v-if="isShowTip">
                        <i-carbon-touch-1-filled class="animate-[wiggle_5s_infinite_forwards] text-4xl text-yellow-400" />
                        <div class="absolute w-60 -bottom-10 -left-20 -rotate-3 font-bold">將線索拖曳到時間軌跡上！</div>
                    </div>
                </div>
                <div v-else class="absolute h-[145px] w-full top-8 z-10 flex flex-col justify-center items-center text-center bg-gray-500 text-white rounded-lg">
                    <div class="text-2xl font-bold">遊戲結束</div>
                    很厲害喔! <br />你共答對 {{ gameStatus.stepCorrect.filter((item) => item).length }} 題 <br />
                    得分 {{ gameStatus.score }} 分
                    <i-majesticons-lightbulb-shine class="absolute top-4 right-10 rotate-180 text-yellow-300 text-4xl"></i-majesticons-lightbulb-shine>
                </div>
                <div ref="timelineContainerEl" class="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-full px-4">
                    <div :style="{ paddingTop: timelineContainerTop }" class="transition-all duration-700 relative h-full flex flex-col items-center z-0">
                        <div ref="anchorBeforeEl" class="text-[#b1aea4]">BEFORE</div>
                        <div class="w-0.5 h-full bg-white"></div>
                        <div class="text-[#b1aea4] mb-4">AFTER</div>
                    </div>
                    <div ref="timelineEl" class="absolute w-full h-[480px] bottom-0 left-1/2 -translate-x-1/2">
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
                            :style="timelineEventsStyleRaw[index]"
                        >
                            <div class="absolute left-1/2 top-0 -translate-x-1/2 translate-y-[-18px] bg-[#f2f1e7] rounded-t-full text-base px-3.5 z-3 text-[#f2f1e7] h-4">
                                {{ timelineEvent.year }}
                            </div>
                            <div class="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-[#b6b3a4] rounded-full text-base px-2 py-0.5 text-white font-Libre">
                                {{ timelineEvent.year }}
                            </div>
                            <img class="w-[65px] h-[65px] shrink-0" :src="timelineEvent.image" alt="" />
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
</style>

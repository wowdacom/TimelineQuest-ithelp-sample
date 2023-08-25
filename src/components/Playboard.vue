<script setup>
import { ref, reactive, watch } from 'vue';
import { isMobile } from '../utils/device-detect';
import cluesData from '../assets/clues.json';

const isGameStart = ref(true);
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
const answeringStyleRaw = reactive({
    timelineContainer: {
        paddingTop: '180px',
    },
    timelineEvents: [
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
        {
            transform: 'translate(-50%, 160px)',
        },
    ],
    hint: {
        top: '80px',
    },
});

const answeringStyle = reactive(JSON.parse(JSON.stringify(answeringStyleRaw)));

const handleClueCardClick = (cardIndex) => {
    if (isMobile()) {
        return;
    }
    console.log('click');
    currentClueCardEl.value = clueCardEl.value[cardIndex];
    document.body.append(currentClueCardEl.value);
};

const handleClueCardTouch = (cardIndex, ev) => {
    console.log('touch');
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
    isShowHint.value = false;
};

const handleClueCardTouchOff = (cardIndex) => {
    clueCardContainerEl.value.append(currentClueCardEl.value);
    setCurrentClueCardMove(0, 0);
    isShowHint.value = false;
    answeringStyleRaw.timelineContainer.paddingTop = '180px';
    answeringStyleRaw.timelineEvents.forEach((element, index) => {
        answeringStyleRaw.timelineEvents[index].transform = `translate(-50%, ${currentTimelinePosition.value[index].y}px)`;
    });
};

const handleClueCardMove = (ev) => {
    setCurrentClueCardMove(ev.touches[0].pageX, ev.touches[0].pageY - currentClueCardEl.value.offsetHeight / 2);
    handleAnswering();
};

const setCurrentClueCardMove = (left, top) => {
    currentClueCardEl.value.style.left = left + 'px';
    currentClueCardEl.value.style.top = top + 'px';
};

const handleAnswering = () => {
    const currentCardState = currentClueCardEl.value.getBoundingClientRect();
    const timelineElState = timelineEl.value.getBoundingClientRect();
    const timelineEventsElState = timelineEventsEl.value.map((el) => el.getBoundingClientRect());
    const hintHeight = hintEl.value.getBoundingClientRect().height;
    const timelineEventHeight = timelineEventsElState[0].height;

    //處理拖曳時的時間軸拉伸
    if (currentCardState.bottom > timelineElState.top) {
        isShowHint.value = true;
        answeringStyleRaw.timelineContainer.paddingTop = '40px';
    } else {
        isShowHint.value = false;
        answeringStyleRaw.timelineContainer.paddingTop = '180px';
    }

    if (gameStatus.currentStep === 1) {
        if (currentCardState.bottom > timelineEventsElState[0].bottom) {
            answeringStyle.hint.top = `${85 + timelineEventHeight + hintHeight + 28}px`;
        } else {
            answeringStyle.hint.top = '85px';
        }
    }

    if (gameStatus.currentStep === 2) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
        let overOutlineCount = timelineEventCenterLines.reduce((acc, cur) => {
            if (currentCardState.bottom > cur) {
                return acc + 1;
            }
            return acc;
        }, 0);

        answeringStyleRaw.timelineEvents.forEach((element, index) => {
            if (index < overOutlineCount) {
                answeringStyleRaw.timelineEvents[index].transform = `translate(-50%, ${currentTimelinePosition.value[index].y - hintHeight}px)`;
            } else {
                answeringStyleRaw.timelineEvents[index].transform = `translate(-50%, ${currentTimelinePosition.value[index].y}px)`;
            }
        });
        answeringStyleRaw.hint.top = `${75 + overOutlineCount * (timelineEventHeight + 19)}px`;
    }

    if (gameStatus.currentStep > 2) {
        //計算每張 timelineEvent 的中心線，如果超過就移動 hint
        let timelineEventCenterLines = timelineEventsElState.map((el) => window.scrollY + el.top + el.height / 2);
        let overOutlineCount = timelineEventCenterLines.reduce((acc, cur) => {
            if (currentCardState.bottom > cur) {
                return acc + 1;
            }
            return acc;
        }, 0);

        answeringStyleRaw.timelineEvents.forEach((element, index) => {
            if (index < overOutlineCount) {
                answeringStyleRaw.timelineEvents[index].transform = `translate(-50%, ${currentTimelinePosition.value[index].y - hintHeight}px)`;
            } else {
                answeringStyleRaw.timelineEvents[index].transform = `translate(-50%, ${currentTimelinePosition.value[index].y}px)`;
            }
        });

        if (overOutlineCount === 0) {
            answeringStyleRaw.hint.top = '-40px';
        } else {
            answeringStyleRaw.hint.top = `${-40 + overOutlineCount * ((timelineEventHeight + 28) / 2) + hintHeight / 2}px`;
        }
    }
};

watch(
    () => gameStatus.currentStep,
    (currentStep) => {
        if (currentStep === 1) {
            answeringStyleRaw.timelineEvents[0].transform = 'translate(-50%, 160px)';
        }
        if (currentStep === 2) {
            answeringStyleRaw.hint.top = '75px';
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
        }
        if (currentStep === 3) {
            answeringStyleRaw.hint.top = '75px';
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
        }
        if (currentStep === 4) {
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
            answeringStyleRaw.timelineEvents[3].transform = `translate(-50%, ${currentTimelinePosition.value[3].y}px)`;
        }
        if (currentStep === 5) {
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
            answeringStyleRaw.timelineEvents[3].transform = `translate(-50%, ${currentTimelinePosition.value[3].y}px)`;
            answeringStyleRaw.timelineEvents[4].transform = `translate(-50%, ${currentTimelinePosition.value[4].y}px)`;
        }
        if (currentStep === 6) {
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
            answeringStyleRaw.timelineEvents[3].transform = `translate(-50%, ${currentTimelinePosition.value[3].y}px)`;
            answeringStyleRaw.timelineEvents[4].transform = `translate(-50%, ${currentTimelinePosition.value[4].y}px)`;
            answeringStyleRaw.timelineEvents[5].transform = `translate(-50%, ${currentTimelinePosition.value[5].y}px)`;
        }
        if (currentStep === 7) {
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
            answeringStyleRaw.timelineEvents[3].transform = `translate(-50%, ${currentTimelinePosition.value[3].y}px)`;
            answeringStyleRaw.timelineEvents[4].transform = `translate(-50%, ${currentTimelinePosition.value[4].y}px)`;
            answeringStyleRaw.timelineEvents[5].transform = `translate(-50%, ${currentTimelinePosition.value[5].y}px)`;
            answeringStyleRaw.timelineEvents[6].transform = `translate(-50%, ${currentTimelinePosition.value[6].y}px)`;
        }
        if (currentStep === 8) {
            answeringStyleRaw.timelineEvents[0].transform = `translate(-50%, ${currentTimelinePosition.value[0].y}px)`;
            answeringStyleRaw.timelineEvents[1].transform = `translate(-50%, ${currentTimelinePosition.value[1].y}px)`;
            answeringStyleRaw.timelineEvents[2].transform = `translate(-50%, ${currentTimelinePosition.value[2].y}px)`;
            answeringStyleRaw.timelineEvents[3].transform = `translate(-50%, ${currentTimelinePosition.value[3].y}px)`;
            answeringStyleRaw.timelineEvents[4].transform = `translate(-50%, ${currentTimelinePosition.value[4].y}px)`;
            answeringStyleRaw.timelineEvents[5].transform = `translate(-50%, ${currentTimelinePosition.value[5].y}px)`;
            answeringStyleRaw.timelineEvents[6].transform = `translate(-50%, ${currentTimelinePosition.value[6].y}px)`;
            answeringStyleRaw.timelineEvents[7].transform = `translate(-50%, ${currentTimelinePosition.value[7].y}px)`;
        }
    },
);

watch(
    () => JSON.stringify(answeringStyleRaw),
    (newVal) => {
        Object.assign(answeringStyle, JSON.parse(newVal));
    },
);

const gameInit = () => {
    timelineEvents.value.push({ ...cluesData[0] });
    timelineEvents.value.push({ ...cluesData[1] });
    timelineEvents.value.push({ ...cluesData[2] });
    timelineEvents.value.push({ ...cluesData[3] });
    timelineEvents.value.push({ ...cluesData[4] });
    timelineEvents.value.push({ ...cluesData[5] });
    timelineEvents.value.push({ ...cluesData[6] });
    clues.value = [...cluesData.slice(7)];
    gameStatus.currentStep = 7;
};
gameInit();
</script>

<template>
    <div class="w-[375px] h-[667px] border border-light-400">
        <div class="w-full h-full flex justify-center items-center">
            <div class="w-full h-full relative" v-if="isGameStart">
                <div class="mx-1 h-8 flex justify-center items-center relative">
                    <div class="mr-2 text-sm font-Libre">{{ gameStatus.currentStep }} of {{ gameStatus.totalStep }}</div>
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
                    <div class="ml-2 text-sm font-Libre">{{ gameStatus.score }} Points</div>
                    <div class="ml-2 w-5 h-5 mt-0.5 flex justify-center items-center border-2 border-[#b1aea4] text-[#b1aea4] rounded-full">
                        <i-healthicons-question-mark class="text-sm" />
                    </div>
                </div>
                <div ref="clueCardContainerEl" class="absolute h-[145px] left-1/2 top-8 z-10">
                    <div
                        ref="clueCardEl"
                        v-for="(clue, index) in clues"
                        :key="clue"
                        class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center w-[360px] px-2 py-3 border rounded-lg mx-auto bg-white shadow-bottom"
                        :class="isShowTip ? 'animate-[wiggleCard_5s_infinite_forwards]' : ''"
                        @mousedown.stop="handleClueCardClick(event, index)"
                        @mouseup.stop="handleClueCardClickOff(index)"
                        @touchstart.stop="handleClueCardTouch(index, $event)"
                        @touchend.stop="handleClueCardTouchOff(index)"
                        @dragstart="() => false"
                    >
                        <img class="w-[100px] h-[100px] mr-2 shrink-0" :src="clue.image" alt="" />
                        <p class="text-sm font-bold">{{ clue.description }}</p>
                        <div class="absolute right-2 bottom-2 font-Libre text-[#b1aea4] text-sm">{{ clue.point }} Points</div>
                    </div>
                    <div class="absolute bottom-10 right-24 translate-x-1/2 translate-y-10" v-if="isShowTip">
                        <i-carbon-touch-1-filled class="animate-[wiggle_5s_infinite_forwards] text-4xl text-yellow-400" />
                        <div class="absolute w-60 -bottom-10 -left-20 -rotate-3 font-bold">將線索拖曳到時間軌跡上！</div>
                    </div>
                </div>
                <div ref="timelineContainerEl" class="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-full px-4">
                    <div :style="answeringStyle.timelineContainer" class="transition-all duration-700 relative h-full flex flex-col items-center">
                        <div ref="anchorBeforeEl" class="text-[#b1aea4]">BEFORE</div>
                        <div class="w-0.5 h-full bg-white"></div>
                        <div class="text-[#b1aea4] mb-4">AFTER</div>
                    </div>
                    <div ref="timelineEl" class="absolute w-full h-[480px] bottom-0 left-1/2 -translate-x-1/2">
                        <div
                            ref="hintEl"
                            :style="answeringStyle.hint"
                            v-show="isShowHint"
                            class="w-[360px] h-[120px] bg-[#f9d988] rounded-lg absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                        ></div>
                        <div
                            ref="timelineEventsEl"
                            v-for="(timelineEvent, index) in timelineEvents"
                            :key="timelineEvent.year"
                            class="mx-auto absolute top-0 left-1/2 w-[350px] bg-[#e3e0d5] rounded-lg py-[12px] px-[10px] flex items-center border-t-4 border-t-[#f2f1e7]"
                            :style="answeringStyle.timelineEvents[index]"
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
                <div class="h-5 absolute top-2 right-2 border-2 border-[#b1aea4] text-[#b1aea4] rounded-full">
                    <i-healthicons-question-mark class="text-sm" />
                </div>
                <i-clarity-beta-solid class="text-5xl text-[#5D72C8] opacity-30" />
                <h1 class="text-4xl font-extrabold mb-3">時間線任務</h1>
                <h4 class="mb-5 text-[#b1aea4]">2023年9月1日</h4>
                <h2 class="mb-2 text-center">你能把八個重要事件<br />按照時間順序排列嗎？</h2>
                <button class="rounded-full border w-[150px] h-[40px] bg-[#5d72c9] text-white">開始遊戲 <i-maki-arrow class="inline-block" /></button>
            </div>
        </div>

        <div v-if="isShowInstructions" class="mx-auto w-11/12 px-4 py-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg">
            <i-iconoir-cancel class="absolute right-2 top-2 text-xl" />
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
    </div>
</template>
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Libre+Franklin:wght@700&display=swap');
</style>

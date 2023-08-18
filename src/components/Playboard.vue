<script setup>
import { ref } from 'vue';

const isGameStart = ref(true);
</script>

<template>
    <div class="w-[375px] h-[667px] border border-light-400">
        <div class="w-full h-full flex justify-center items-center">
            <div class="w-full h-full" v-if="isGameStart">
                <div class="mx-1 h-8 flex justify-center items-center relative">
                    <div class="mr-2 text-sm font-Libre">1 of 8</div>
                    <ul class="flex items-center">
                        <li class="w-6 h-2.5 mr-[2px] border-2 border-[#e3e0d5] rounded-full shrink-0 bg-[#e3e0d5]" v-for="item in 8"></li>
                    </ul>
                    <div class="ml-2 text-sm font-Libre">0 Points</div>
                    <div class="ml-2 w-5 h-5 mt-0.5 flex justify-center items-center border-2 border-[#b1aea4] text-[#b1aea4] rounded-full">
                        <i-healthicons-question-mark class="text-sm" />
                    </div>
                </div>
                <div class="relative h-[145px]">
                    <div v-for="clue in 8" class="absolute top-0 left-1/2 -translate-x-1/2 flex items-center w-[360px] px-2 py-3 border rounded-lg mx-auto bg-white shadow-bottom">
                        <img
                            class="w-[100px] h-[100px] mr-2"
                            src="https://static01.nytimes.com/newsgraphics/2023-01-05-headlines/dbee7ea268717ea6be65b1bd8bbbb1a46bdf16b8/_assets/images/clues/2023-08-13/buddha.jpg"
                            alt=""
                        />
                        <p class="text-sm font-bold">Prince Siddhartha Gautama is born. He is said to renounce his way of life to wander, becoming the Buddha. {{ clue }}</p>
                        <div class="absolute right-2 bottom-2 font-Libre text-[#b1aea4] text-sm">2 Points</div>
                    </div>
                    <div class="absolute text-base text-white px-2 top-0 left-1/2 -translate-y-1/2 -translate-x-1/2 font-Libre rounded-full bg-[#b6b3a4]">Circa 400s B.C.</div>
                    <div class="absolute bottom-10 right-24 translate-x-1/2 translate-y-10">
                        <i-pepicons-pencil-hand-point class="animate-[wiggle_5s_infinite_forwards] -rotate-45 text-4xl" />
                        <div class="absolute w-60 -bottom-10 -left-20 -rotate-3 font-bold">將線索拖曳到時間軌跡上！</div>
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

        <div class="mx-auto w-11/12 px-4 py-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg hidden">
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

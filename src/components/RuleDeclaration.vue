<template>
  <div>
    <Lightbox
      :is-show="isShowInstructions"
      @update:is-show="handleShowInstructions"
    >
      <template #lightbox-trigger>
        <i-healthicons-question-mark
          class="text-sm"
        />
      </template>
      <template #lightbox-content>
        <h1 class="text-2xl font-bold mb-6 text-center">
          怎麼玩時間線任務
        </h1>
        <div class="">
          <p class="mb-2">
            將每張線索卡按照時間順序放置在時間軌跡上：
          </p>
          <div class="flex mb-4">
            <ol class="list-decimal pl-4 mb-4">
              <li class="mb-2">
                將線索拖曳至其他事件之間、之前或之後。
              </li>
              <li class="mb-2">
                將卡片從最早（頂部）排列至最晚（底部）。
              </li>
              <li class="mb-2">
                按下「點擊以放置」以確認位置。
              </li>
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
              >
            </video>
          </div>
          <p class="mb-2">
            錯誤的線索將在每回合移至正確的位置。正確的線索可獲得2至5分。完美分數為28分。
          </p>
          <p>編輯根據時報的報導選擇線索。每一份被推動的社會進步將會有一個新的問答遊戲。</p>
        </div>
      </template>
    </Lightbox>
  </div>
</template>

<script setup>
import Lightbox from './Lightbox.vue';
import { ref } from 'vue';
  const isShowInstructions = ref(false);
  const handleShowInstructions = (ev) => {
      isShowInstructions.value = ev;
  };
</script>
<template>
  <div
    class="h-5 border-2 border-[#b1aea4] text-[#b1aea4] rounded-full"
    @click="toggleInstructions"
  >
    <slot name="lightbox-trigger" />
  </div>
  <Teleport to="body">
    <div
      v-if="isShow"
      class="mx-auto w-11/12 px-4 py-12 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg z-20"
    >
      <i-iconoir-cancel
        class="absolute right-2 top-2 text-xl"
        @click="toggleInstructions"
      />
      <slot name="lightbox-content" />
    </div>
  </Teleport>
</template>
  
  <script setup>
const props = defineProps({
    isShow: {
        type: Boolean,
        default: false,
        required: true
    },
});

const emit = defineEmits(['update:isShow']);

const toggleInstructions = () => {
  emit('update:isShow', !props.isShow);
}; 
  </script>
 
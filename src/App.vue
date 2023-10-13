<script setup>
import Playboard from './components/Playboard.vue';
import axios from 'axios';
import { ref } from 'vue';

const clues = ref([]);
const getClues = async () => {
    const uri = 'https://script.google.com/macros/s/AKfycbywTCx4ij7158tGVE-buIiaprdPQjhXWfIq8hXYuZAzlVA5dpehNchiJFVaPxxE9UI8/exec';
    const { data } = await axios.get(uri);
    clues.value = data;
};

getClues();
</script>

<template>
    <div class="flex justify-center items-center min-h-screen relative overflow-hidden bg-[#f2f1e7]">
        <Playboard :questions="clues" />
    </div>
</template>

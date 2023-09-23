import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest"
import Playboard from "@/components/Playboard.vue";

describe("Playboard.vue", () => {
    it("renders mounted 顯示標題，測試物件基本渲染", () => {
        const msg = "時間線任務";
        const wrapper = shallowMount(Playboard);
        const title = wrapper.get('[data-test="title"]')
        expect(title.text()).toMatch(msg);
    });

    it("頁面切換",async () => {
        const wrapper = shallowMount(Playboard);
        const btn = wrapper.get('[data-test="game-start-btn"]')
        await btn.trigger('click')
        expect(wrapper.get('[data-test="timeline"]').exists()).toBe(true)
    });

    it("計分", async () => {
        const wrapper = shallowMount(Playboard);
        wrapper.vm.isGameStart = true
        wrapper.vm.gameStatus.scoreRecord = [1, 2, 3, 4, 5]
        wrapper.vm.gameStatus.score = wrapper.vm.getTotalScore()
        await wrapper.vm.$nextTick()
        expect(wrapper.get('[data-test="score"]').text()).include(15)
    });

    it("分數回饋", async () => {
        const wrapper = shallowMount(Playboard);
        wrapper.vm.isGameEnd = true
        const msg = '非常好！你對網頁開發的歷史有著很好的掌握，在這個領域幾乎是專家囉。';
        const comment = wrapper.vm.gameComment(20)
        expect(comment).toBe(msg)
    });
});
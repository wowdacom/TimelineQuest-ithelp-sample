describe('測試在 Mobile 版本下的拖曳功能', () => {
  beforeEach(() => {
    cy.viewport('iphone-6')
  })
  it('正確與錯誤兩種情況產生的作答結果', () => { 
    cy.visit('http://localhost:5173/TimelineQuest-ithelp-sample/')
    cy.get('[data-test="game-start-btn"]').click()
    cy.get('[data-test="timeline"]').should('be.visible')
    cy.get('[data-test="clue-card"]').trigger('touchstart').trigger('touchmove', { which: 1, pageX: 190, pageY: 250 }).trigger('touchend')
    cy.get('[data-test="timeline-event-year-correct"]').should('have.text', '1995').should('have.class', 'bg-[#5cb887]')
    cy.get('[data-test="clue-card"]').trigger('touchstart').trigger('touchmove', { which: 1, pageX: 190, pageY: 450 }).trigger('touchend')
    cy.get('[data-test="timeline-event-year-wrong"]').should('have.text', '2015').should('have.class', 'bg-[#d25353]')
  })
})
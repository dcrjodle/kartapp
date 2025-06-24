// Custom commands for map testing
Cypress.Commands.add('getMap', () => {
  return cy.get('[data-testid="custom-map"]');
});

Cypress.Commands.add('getMapControls', () => {
  return cy.get('[data-testid="map-controls"]');
});

Cypress.Commands.add('getProvince', (provinceName) => {
  return cy.get(`[data-testid="province-${provinceName}"]`);
});

Cypress.Commands.add('getCityMarker', (cityName) => {
  return cy.get(`[data-testid="city-${cityName}"]`);
});

Cypress.Commands.add('getClouds', () => {
  return cy.get('[data-testid="clouds"]');
});

Cypress.Commands.add('waitForMapLoad', () => {
  cy.getMap().should('be.visible');
  cy.get('svg').should('be.visible');
  // Wait for provinces to load
  cy.get('path[data-testid^="province-"]').should('have.length.greaterThan', 0);
});

Cypress.Commands.add('zoomIn', (times = 1) => {
  for (let i = 0; i < times; i++) {
    cy.getMapControls().find('[data-testid="zoom-in"]').click();
  }
});

Cypress.Commands.add('zoomOut', (times = 1) => {
  for (let i = 0; i < times; i++) {
    cy.getMapControls().find('[data-testid="zoom-out"]').click();
  }
});

Cypress.Commands.add('resetView', () => {
  cy.getMapControls().find('[data-testid="reset-view"]').click();
});

// Accessibility helpers
Cypress.Commands.add('checkA11y', (element = null) => {
  const target = element || 'body';
  cy.get(target).should('be.visible');
  // Basic accessibility checks
  cy.get('button').should('have.attr', 'type');
  cy.get('[role]').should('exist');
});
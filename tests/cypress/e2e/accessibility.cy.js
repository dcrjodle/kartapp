describe('Accessibility', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMapLoad();
  });

  it('should have proper ARIA labels and roles', () => {
    // Map should have appropriate role
    cy.getMap().should('have.attr', 'role');
    
    // Controls should have proper labels
    cy.get('[data-testid="zoom-in"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="zoom-out"]').should('have.attr', 'aria-label');
    cy.get('[data-testid="reset-view"]').should('have.attr', 'aria-label');
  });

  it('should support keyboard navigation for map controls', () => {
    // Focus first control
    cy.get('[data-testid="zoom-in"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'zoom-in');
    
    // Test Enter key activation
    cy.focused().type('{enter}');
    cy.getMap().find('g').first().invoke('attr', 'transform').should('contain', 'scale');
    
    // Focus next control
    cy.get('[data-testid="zoom-out"]').focus();
    cy.focused().should('have.attr', 'data-testid', 'zoom-out');
    
    // Test Space key activation
    cy.focused().type(' ');
    cy.getMap().find('g').first().invoke('attr', 'transform').should('contain', 'scale');
  });

  it('should support keyboard navigation for provinces', () => {
    // Province should be focusable
    cy.get('path[data-testid^="province-"]').first().focus();
    cy.focused().should('have.attr', 'data-testid').and('contain', 'province-');
    
    // Enter key should select province
    cy.focused().type('{enter}');
    cy.get('[data-testid="province-info"]').should('be.visible');
    
    // Focus another province
    cy.get('path[data-testid^="province-"]').eq(1).focus().type(' ');
    cy.get('[data-testid="province-info"]').should('be.visible');
  });

  it('should provide screen reader instructions', () => {
    // Look for screen reader only content
    cy.get('.sr-only, .visually-hidden, [class*="screen-reader"]').should('exist');
  });

  it('should have proper focus indicators', () => {
    // Controls should have visible focus
    cy.get('[data-testid="zoom-in"]').focus();
    cy.focused().should('have.css', 'outline').and('not.equal', 'none');
    
    // Provinces should have focus indicators
    cy.get('path[data-testid^="province-"]').first().focus();
    cy.focused().should('have.css', 'outline').and('not.equal', 'none');
  });

  it('should support keyboard-only navigation flow', () => {
    // Focus each control in sequence
    cy.get('[data-testid="zoom-in"]').focus();
    cy.focused().should('be.visible');
    
    cy.get('[data-testid="zoom-out"]').focus();
    cy.focused().should('be.visible');
    
    cy.get('[data-testid="reset-view"]').focus();
    cy.focused().should('be.visible');
    
    // Focus provinces
    cy.get('path[data-testid^="province-"]').first().focus();
    cy.focused().should('be.visible');
  });

  it('should have appropriate color contrast', () => {
    // Test province colors against background
    cy.get('path[data-testid^="province-"]').first().then(($province) => {
      const fill = $province.css('fill');
      const computedStyle = window.getComputedStyle($province[0]);
      expect(fill).to.not.equal('transparent');
      expect(fill).to.not.equal('rgba(0, 0, 0, 0)');
    });
    
    // Test control button contrast
    cy.get('[data-testid="zoom-in"]').then(($button) => {
      const backgroundColor = $button.css('background-color');
      const color = $button.css('color');
      expect(backgroundColor).to.not.equal(color);
    });
  });

  it('should handle reduced motion preferences', () => {
    // Mock reduced motion preference
    cy.window().then((win) => {
      Object.defineProperty(win, 'matchMedia', {
        writable: true,
        value: cy.stub().returns({
          matches: true,
          media: '(prefers-reduced-motion: reduce)',
          onchange: null,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
          dispatchEvent: cy.stub(),
        }),
      });
    });
    
    cy.reload();
    cy.waitForMapLoad();
    
    // Check that animations are disabled or reduced
    cy.getClouds().should('have.css', 'animation-duration', '0s')
      .or('have.css', 'animation-play-state', 'paused');
  });

  it('should provide meaningful error messages', () => {
    // Test error states (if any)
    cy.window().then((win) => {
      // Mock a network error or data loading failure
      cy.intercept('GET', '**/data/**', { forceNetworkError: true }).as('dataError');
    });
    
    cy.reload();
    
    // Should show user-friendly error message
    cy.get('[data-testid="error-message"]', { timeout: 10000 }).should('be.visible')
      .or(cy.get('[role="alert"]').should('exist'));
  });

  it('should support assistive technology announcements', () => {
    // Test live regions for dynamic content
    cy.get('path[data-testid^="province-"]').first().click();
    
    // Should have aria-live region for announcements
    cy.get('[aria-live="polite"], [aria-live="assertive"]').should('exist');
  });

  it('should handle high contrast mode', () => {
    // Test forced colors mode
    cy.window().then((win) => {
      Object.defineProperty(win, 'matchMedia', {
        writable: true,
        value: cy.stub().returns({
          matches: true,
          media: '(forced-colors: active)',
          onchange: null,
          addListener: cy.stub(),
          removeListener: cy.stub(),
          addEventListener: cy.stub(),
          removeEventListener: cy.stub(),
          dispatchEvent: cy.stub(),
        }),
      });
    });
    
    cy.reload();
    cy.waitForMapLoad();
    
    // Elements should still be visible and interactive
    cy.get('path[data-testid^="province-"]').should('be.visible');
    cy.getMapControls().should('be.visible');
  });
});
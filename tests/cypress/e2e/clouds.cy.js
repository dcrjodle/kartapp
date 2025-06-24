describe('Cloud Animations', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMapLoad();
  });

  it('should display clouds element', () => {
    cy.getClouds().should('be.visible');
  });

  it('should have animated clouds with CSS animations', () => {
    cy.getClouds().should('have.css', 'animation-duration').and('not.equal', '0s');
  });

  it('should reduce cloud opacity when a province is selected', () => {
    // Get initial cloud opacity
    cy.getClouds().then(($clouds) => {
      const initialOpacity = parseFloat($clouds.css('opacity'));
      
      // Select a province
      cy.get('path[data-testid^="province-"]').first().click();
      
      // Check that opacity has decreased
      cy.getClouds().should(($newClouds) => {
        const newOpacity = parseFloat($newClouds.css('opacity'));
        expect(newOpacity).to.be.lessThan(initialOpacity);
      });
    });
  });

  it('should restore cloud opacity when province is deselected', () => {
    // Select a province first
    cy.get('path[data-testid^="province-"]').first().click();
    
    // Get reduced opacity
    cy.getClouds().then(($clouds) => {
      const reducedOpacity = parseFloat($clouds.css('opacity'));
      
      // Deselect province by clicking empty area
      cy.getMap().find('svg').click(100, 100);
      
      // Check that opacity has increased back
      cy.getClouds().should(($newClouds) => {
        const restoredOpacity = parseFloat($newClouds.css('opacity'));
        expect(restoredOpacity).to.be.greaterThan(reducedOpacity);
      });
    });
  });

  it('should maintain cloud animations during interactions', () => {
    // Check animation is running
    cy.getClouds().should('have.css', 'animation-play-state', 'running');
    
    // Interact with map (zoom, select province)
    cy.zoomIn();
    cy.get('path[data-testid^="province-"]').first().click();
    
    // Animation should still be running
    cy.getClouds().should('have.css', 'animation-play-state', 'running');
  });

  it('should handle cloud visibility during zoom operations', () => {
    cy.getClouds().should('be.visible');
    
    // Zoom in multiple times
    cy.zoomIn(5);
    cy.getClouds().should('be.visible');
    
    // Zoom out
    cy.zoomOut(3);
    cy.getClouds().should('be.visible');
    
    // Reset view
    cy.resetView();
    cy.getClouds().should('be.visible');
  });

  it('should have appropriate z-index layering', () => {
    // Clouds should be behind interactive elements but visible
    cy.getClouds().should('be.visible');
    cy.get('path[data-testid^="province-"]').first().should('be.visible');
    
    // Test that provinces are clickable (not obscured by clouds)
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid="province-info"]').should('be.visible');
  });

  it('should handle responsive cloud behavior', () => {
    // Test on different viewport sizes
    cy.viewport(1920, 1080);
    cy.getClouds().should('be.visible');
    
    cy.viewport(768, 1024);
    cy.getClouds().should('be.visible');
    
    cy.viewport(375, 667);
    cy.getClouds().should('be.visible');
  });
});
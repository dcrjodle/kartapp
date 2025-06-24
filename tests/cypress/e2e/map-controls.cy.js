describe('Map Controls', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMapLoad();
  });

  it('should display all control buttons', () => {
    cy.getMapControls().should('be.visible');
    cy.get('[data-testid="zoom-in"]').should('be.visible');
    cy.get('[data-testid="zoom-out"]').should('be.visible');
    cy.get('[data-testid="reset-view"]').should('be.visible');
  });

  it('should zoom in when zoom-in button is clicked', () => {
    // Get initial zoom level by checking SVG transform
    cy.getMap().find('g').first().invoke('attr', 'transform').then((initialTransform) => {
      cy.zoomIn();
      cy.getMap().find('g').first().invoke('attr', 'transform').should('not.equal', initialTransform);
    });
  });

  it('should zoom out when zoom-out button is clicked', () => {
    // First zoom in to have something to zoom out from
    cy.zoomIn(2);
    cy.getMap().find('g').first().invoke('attr', 'transform').then((zoomedTransform) => {
      cy.zoomOut();
      cy.getMap().find('g').first().invoke('attr', 'transform').should('not.equal', zoomedTransform);
    });
  });

  it('should reset view when reset button is clicked', () => {
    // First zoom and pan to change the view
    cy.zoomIn(3);
    cy.getMap().trigger('mousedown', { which: 1, clientX: 300, clientY: 300 });
    cy.getMap().trigger('mousemove', { which: 1, clientX: 400, clientY: 400 });
    cy.getMap().trigger('mouseup');
    
    // Reset view
    cy.resetView();
    
    // Check that transform is reset (should contain scale close to 1)
    cy.getMap().find('g').first().invoke('attr', 'transform').then((transform) => {
      expect(transform).to.match(/scale\(1[.,]?\d*\)/);
    });
  });

  it('should handle keyboard navigation for controls', () => {
    cy.get('[data-testid="zoom-in"]').focus().type('{enter}');
    cy.getMap().find('g').first().invoke('attr', 'transform').should('contain', 'scale');
    
    cy.get('[data-testid="zoom-out"]').focus().type(' ');
    cy.getMap().find('g').first().invoke('attr', 'transform').should('contain', 'scale');
    
    cy.get('[data-testid="reset-view"]').focus().type('{enter}');
    cy.getMap().find('g').first().invoke('attr', 'transform').should('contain', 'scale');
  });

  it('should handle mouse wheel zoom', () => {
    cy.getMap().find('g').first().invoke('attr', 'transform').then((initialTransform) => {
      cy.getMap().trigger('wheel', { deltaY: -100 });
      cy.getMap().find('g').first().invoke('attr', 'transform').should('not.equal', initialTransform);
    });
  });

  it('should handle pan with mouse drag', () => {
    cy.getMap().find('g').first().invoke('attr', 'transform').then((initialTransform) => {
      cy.getMap().trigger('mousedown', { which: 1, clientX: 400, clientY: 300 });
      cy.getMap().trigger('mousemove', { which: 1, clientX: 500, clientY: 400 });
      cy.getMap().trigger('mouseup');
      cy.getMap().find('g').first().invoke('attr', 'transform').should('not.equal', initialTransform);
    });
  });
});
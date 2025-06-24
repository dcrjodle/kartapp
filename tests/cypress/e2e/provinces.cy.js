describe('Province Interactions', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMapLoad();
  });

  it('should display all provinces on map load', () => {
    cy.get('path[data-testid^="province-"]').should('have.length.greaterThan', 20);
    // Sweden has 21 provinces, so we should see at least 20
    cy.get('path[data-testid^="province-"]').should('have.length.lessThan', 25);
  });

  it('should change province fill color on hover', () => {
    cy.get('path[data-testid^="province-"]').first().then(($province) => {
      const initialFill = $province.css('fill');
      cy.wrap($province).trigger('mouseover');
      cy.wrap($province).should('not.have.css', 'fill', initialFill);
    });
  });

  it('should select province on click and show selection state', () => {
    cy.get('path[data-testid^="province-"]').first().then(($province) => {
      cy.wrap($province).click();
      
      // Check if province has selected state (different styling)
      cy.wrap($province).should('have.attr', 'data-selected', 'true');
      
      // Check if province info is displayed
      cy.get('[data-testid="province-info"]').should('be.visible');
    });
  });

  it('should deselect province when clicking on empty area', () => {
    // First select a province
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid="province-info"]').should('be.visible');
    
    // Click on empty area (SVG background)
    cy.getMap().find('svg').click(100, 100);
    
    // Check that province is deselected
    cy.get('[data-testid="province-info"]').should('not.exist');
    cy.get('path[data-selected="true"]').should('not.exist');
  });

  it('should handle province selection with keyboard navigation', () => {
    cy.get('path[data-testid^="province-"]').first().focus().type('{enter}');
    cy.get('[data-testid="province-info"]').should('be.visible');
    
    // Test space key
    cy.get('path[data-testid^="province-"]').eq(1).focus().type(' ');
    cy.get('[data-testid="province-info"]').should('be.visible');
  });

  it('should show province name and details when selected', () => {
    cy.get('path[data-testid^="province-"]').first().then(($province) => {
      const testId = $province.attr('data-testid');
      const provinceName = testId.replace('province-', '');
      
      cy.wrap($province).click();
      cy.get('[data-testid="province-info"]').should('contain.text', provinceName);
    });
  });

  it('should handle multiple province interactions correctly', () => {
    // Select first province
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid="province-info"]').should('be.visible');
    
    // Select second province (should deselect first)
    cy.get('path[data-testid^="province-"]').eq(1).click();
    cy.get('[data-testid="province-info"]').should('be.visible');
    
    // Should only have one selected province
    cy.get('path[data-selected="true"]').should('have.length', 1);
  });

  it('should maintain province hover state during interaction', () => {
    cy.get('path[data-testid^="province-"]').first().then(($province) => {
      cy.wrap($province).trigger('mouseover');
      cy.wrap($province).should('have.css', 'cursor', 'pointer');
      
      cy.wrap($province).trigger('mouseout');
      cy.wrap($province).should('not.have.css', 'cursor', 'pointer');
    });
  });

  it('should adjust clouds opacity when province is selected', () => {
    cy.getClouds().then(($clouds) => {
      const initialOpacity = $clouds.css('opacity');
      
      cy.get('path[data-testid^="province-"]').first().click();
      
      cy.getClouds().should('have.css', 'opacity').and('not.equal', initialOpacity);
    });
  });
});
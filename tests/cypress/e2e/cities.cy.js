describe('City Markers', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForMapLoad();
  });

  it('should not display city markers initially (before province selection)', () => {
    cy.get('[data-testid^="city-"]').should('not.exist');
  });

  it('should display city markers when a province is selected', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').should('have.length.greaterThan', 0);
  });

  it('should hide city markers when province is deselected', () => {
    // Select a province to show cities
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').should('exist');
    
    // Deselect province
    cy.getMap().find('svg').click(100, 100);
    cy.get('[data-testid^="city-"]').should('not.exist');
  });

  it('should show different cities when different provinces are selected', () => {
    // Select first province
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').then(($firstCities) => {
      const firstCityCount = $firstCities.length;
      
      // Select second province
      cy.get('path[data-testid^="province-"]').eq(1).click();
      cy.get('[data-testid^="city-"]').should('have.length').and('not.equal', firstCityCount);
    });
  });

  it('should have proper city marker styling and visibility', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').first().should('be.visible');
    cy.get('[data-testid^="city-"]').first().should('have.css', 'cursor', 'pointer');
  });

  it('should show city information on hover', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').first().then(($city) => {
      cy.wrap($city).trigger('mouseover');
      // City info tooltip or title should appear
      cy.get('[data-testid="city-info"]').should('be.visible')
        .or(cy.wrap($city).should('have.attr', 'title'));
    });
  });

  it('should handle city marker interactions', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').first().then(($city) => {
      const cityName = $city.attr('data-testid').replace('city-', '');
      
      cy.wrap($city).click();
      // Should show city details or maintain selection
      cy.get('[data-testid="city-info"]').should('contain.text', cityName)
        .or(cy.wrap($city).should('have.attr', 'data-selected', 'true'));
    });
  });

  it('should scale appropriately with zoom level', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').first().then(($city) => {
      const initialTransform = $city.attr('transform') || $city.css('transform');
      
      cy.zoomIn(2);
      cy.get('[data-testid^="city-"]').first().then(($zoomedCity) => {
        const zoomedTransform = $zoomedCity.attr('transform') || $zoomedCity.css('transform');
        expect(zoomedTransform).to.not.equal(initialTransform);
      });
    });
  });

  it('should maintain visibility during pan operations', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').should('be.visible');
    
    // Pan the map
    cy.getMap().trigger('mousedown', { which: 1, clientX: 400, clientY: 300 });
    cy.getMap().trigger('mousemove', { which: 1, clientX: 500, clientY: 400 });
    cy.getMap().trigger('mouseup');
    
    cy.get('[data-testid^="city-"]').should('be.visible');
  });

  it('should handle keyboard navigation for city markers', () => {
    cy.get('path[data-testid^="province-"]').first().click();
    cy.get('[data-testid^="city-"]').first().focus().type('{enter}');
    
    // Should trigger city interaction
    cy.get('[data-testid="city-info"]').should('be.visible')
      .or(cy.get('[data-testid^="city-"]').first().should('have.attr', 'data-selected', 'true'));
  });

  it('should display correct number of cities per province', () => {
    // Test major provinces that should have cities
    const majorProvinces = ['Stockholm', 'Göteborg', 'Malmö'];
    
    majorProvinces.forEach((province) => {
      cy.get(`[data-testid="province-${province}"]`).then(($province) => {
        if ($province.length > 0) {
          cy.wrap($province).click();
          cy.get('[data-testid^="city-"]').should('have.length.greaterThan', 0);
        }
      });
    });
  });
});
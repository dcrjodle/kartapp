# TODO - Map Enhancement Features

## 1. Better City Icons
- [ ] Create SVG generator for city markers with random rectangles
- [ ] Replace current city markers with custom SVG icons
- [ ] Generate unique geometric patterns for each city
- [ ] Ensure icons scale properly with zoom levels
- [ ] Add visual hierarchy based on city population/importance

## 2. Smart Zoom-Based City Rendering
- [ ] Implement zoom depth detection system
- [ ] Create city visibility thresholds based on zoom level
- [ ] Show cities within provinces only at appropriate zoom depths
- [ ] Optimize rendering performance for different zoom levels
- [ ] Add smooth transitions when cities appear/disappear

## 3. Right-Hand Side Information Panel
- [ ] Create new UI component for displaying detailed information
- [ ] Position panel on the right side of the map interface
- [ ] Design responsive layout that works on different screen sizes
- [ ] Add smooth slide-in/slide-out animations
- [ ] Implement data fetching for province information

## 4. Hierarchical City Information Panel
- [ ] Create city information sub-component
- [ ] Implement parent-child relationship between province and city panels
- [ ] Add back arrow navigation from city to province view
- [ ] Ensure smooth transitions between information levels
- [ ] Maintain navigation state and breadcrumb trail
- [ ] Handle cases where user clicks city vs province directly

## Implementation Notes

### City Icons (Priority: Medium)
- Use SVG for scalability and customization
- Consider using city population or importance for icon complexity
- Implement caching for generated icons to improve performance

### Zoom-Based Rendering (Priority: High)
- Current zoom levels: 0.1 to 2.0
- Suggested thresholds:
  - Zoom < 0.5: No cities
  - Zoom 0.5-1.0: Major cities only (population > 100k)
  - Zoom 1.0-1.5: Medium cities (population > 50k)
  - Zoom > 1.5: All cities

### Information Panel (Priority: High)
- Should integrate with existing natural language query system
- Display relevant data when available
- Show placeholder content when no data is loaded
- Support both province and city information display

### Navigation Flow (Priority: Medium)
- Province click → Province info panel
- City click → City info panel (with back to province option)
- Query results → Appropriate info panel
- Maintain history for proper back navigation
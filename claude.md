# Claude Code Notes

This file contains notes and context for Claude Code interactions.

## Project Overview

FRC 2020 Infinite Recharge Scouting Application - A web-based scouting app for tracking robot performance during FRC matches. Built with vanilla HTML, CSS, and JavaScript for portability and ease of use on any device.

## Key Decisions

### Technology Stack
- **No Framework:** Chose vanilla JavaScript for simplicity and no dependencies
- **Client-Side Only:** All data processing happens in the browser, no backend needed
- **Responsive Design:** Works on tablets, laptops, and phones for flexibility

### Game Rules Implementation
- Researched official FRC 2020 Infinite Recharge game manual
- Implemented accurate point values for all scoring actions
- Separated tracking by match periods (Auto, Teleop, Endgame)

### User Experience
- Large, touch-friendly buttons for easy tapping during matches
- Real-time score calculation and display
- Action timeline shows chronological history
- Keyboard shortcuts for advanced users
- Visual feedback on button presses

### Data Export
- JSON format for detailed analysis and data processing
- CSV format for spreadsheet compatibility
- Automatic filename generation with match and team numbers

## Notes

### Field Image
- Field image located at `Images/Screenshot 2025-10-20 223552.png`
- Used as subtle background overlay (5% opacity) to maintain FRC theme
- Image shows the 2020 Infinite Recharge field layout

### Scoring System
**Autonomous (15 sec):**
- Init Line: 5 pts
- Bottom Port: 2 pts
- Outer Port: 4 pts
- Inner Port: 6 pts

**Teleop (105 sec):**
- Bottom Port: 1 pt
- Outer Port: 2 pts
- Inner Port: 3 pts
- Rotation Control: 10 pts
- Position Control: 20 pts

**Endgame (30 sec):**
- Park: 5 pts
- Hang: 25 pts
- Level: 15 pts

### Future Enhancements
- Add photo upload capability for robot pictures
- Implement cloud storage for team-wide data sharing
- Add analytics dashboard for aggregate data analysis
- Include pre-match robot inspection checklist
- Add match prediction based on historical data

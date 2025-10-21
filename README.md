# FRC 2020 Infinite Recharge Scouting App

A comprehensive web-based scouting application for the 2020-2021 FRC Infinite Recharge season. This app allows scouts to track robot performance during matches in real-time using an intuitive button-based interface.

## Features

### Match Setup
- Enter team number and match number
- Select alliance color (Red/Blue)
- Select starting position (Left/Center/Right)
- Record scout name
- Easy start button to begin match tracking

### Real-Time Match Timer
- Automatic period detection (Autonomous, Teleop, Endgame)
- Visual period indicators with color coding
- Pause/Resume functionality
- Match automatically ends at 2:30

### Action Tracking

#### Autonomous Period (15 seconds)
- **Cross Initiation Line** - 5 points (toggle: click once to mark, click again to undo)
- **Bottom Port** - 2 points per power cell
- **Outer Port** - 4 points per power cell
- **Inner Port** - 6 points per power cell

#### Teleop Period
- **Pick Up Ball** - track ball collection
- **Bottom Port** - 1 point per power cell
- **Outer Port** - 2 points per power cell
- **Inner Port** - 3 points per power cell
- **Rotation Control** - 10 points (spin control panel 3-5 times)
- **Position Control** - 20 points (align control panel to color)

#### Endgame (Last 30 seconds)
- **Park** - 5 points (robot in rendezvous point) - toggle button
- **Hang/Climb** - 25 points (robot hanging on bar) - toggle button
- **Level Switch** - 15 points (switch balanced within 8 degrees) - toggle button

**Note:** Toggle buttons (Init Line, Park, Hang, Level) can only be activated once. Click once to activate (button glows and shows ✓), click again to deactivate if you made a mistake.

#### Other Actions
- Playing Defense
- Penalties/Fouls
- Robot Disabled/Breakdown

### Live Score Tracking
- Separate scores for Auto, Teleop, and Endgame
- Real-time total score calculation
- Visual score display panel

### Action Timeline
- Chronological list of all actions
- Timestamps for each action
- Color-coded by period
- Points display for scoring actions

### Notes Section
- Free-form text area for qualitative observations
- Strategy notes
- Robot performance details

### Data Export
- **JSON Export** - Detailed match data with timestamps
- **CSV Export** - Spreadsheet-ready format for analysis
- File naming: `match-[#]-team-[#].[format]`

### Keyboard Shortcuts
Speed up data entry with keyboard shortcuts:

**Autonomous:**
- `i` - Cross initiation line
- `1` - Bottom port
- `2` - Outer port
- `3` - Inner port

**Teleop:**
- `1` - Bottom port
- `2` - Outer port
- `3` - Inner port
- `p` - Pick up ball
- `r` - Rotation control
- `c` - Position control (Color)

**Endgame:**
- `k` - Park (parK)
- `h` - Hang
- `l` - Level

**Always Available:**
- `d` - Defense
- `f` - Foul/penalty
- `x` - Robot disabled
- `Space` - Pause/Resume

## How to Use

1. **Open the App**
   - Open `index.html` in any modern web browser
   - Works on desktop, tablet, and mobile devices

2. **Setup Match**
   - Enter the team number you're scouting
   - Enter the match number
   - Click your alliance color (Red or Blue)
   - Select the robot's starting position (Left, Center, or Right)
   - Optionally enter your name as scout
   - Click "Start Match"

3. **During the Match**
   - Press buttons as actions occur on the field
   - The timer automatically tracks match periods
   - Buttons show in different sections based on period
   - Watch the score update in real-time
   - Add notes in the notes section

4. **After the Match**
   - Click "End Match" or wait for auto-end at 2:30
   - Review the timeline and scores
   - Export data as JSON or CSV
   - Click "New Match" to scout another robot

## Game Reference

### FRC 2020 Infinite Recharge
- **Game Pieces:** Yellow foam Power Cells (7" diameter)
- **Scoring Locations:** Power Port with Bottom, Outer, and Inner targets
- **Control Panel:** Rotation and Position control tasks
- **Endgame:** Climbing on Generator Switch bar

### Match Structure
- **Autonomous:** 0:00 - 0:15 (15 seconds)
- **Teleop:** 0:15 - 2:00 (105 seconds)
- **Endgame:** 2:00 - 2:30 (30 seconds)

## Data Export Format

### JSON Export
Contains complete match data including:
- Match information (team, match number, alliance, scout)
- Scores breakdown
- Full action timeline with timestamps
- Action counts
- Notes

### CSV Export
Spreadsheet format with:
- Match metadata
- Score totals by period
- Count of each action type
- Notes

## Technical Details

- **Technology:** HTML5, CSS3, Vanilla JavaScript
- **Storage:** Client-side only (no backend required)
- **Compatibility:** All modern browsers
- **Responsive:** Works on tablets and mobile devices
- **Field Image:** Subtle background overlay from field image

## Tips for Scouts

1. **Pre-Match:** Familiarize yourself with button locations
2. **Focus:** Watch one robot at a time - don't try to track multiple
3. **Quick Taps:** Use quick button presses for fast action tracking
4. **Shortcuts:** Learn keyboard shortcuts for faster data entry
5. **Notes:** Write key observations during downtimes
6. **Review:** Quickly check timeline after match for accuracy
7. **Export:** Save data immediately after each match

## Customization

The app can be easily customized:
- Edit `styles.css` to change colors and styling
- Modify `script.js` to add custom actions or change scoring
- Update button labels in `index.html` for different tracking needs

## Support

For FRC 2020 Infinite Recharge game rules:
- [Official Game Manual](https://firstfrc.blob.core.windows.net/frc2020/Manual/2020FRCGameSeasonManual.pdf)
- [Game Animation](https://www.youtube.com/watch?v=gmiYWTmFRVE)

## License

Open source - feel free to use and modify for your team's scouting needs!

---

**Good luck scouting!** 🤖⚡

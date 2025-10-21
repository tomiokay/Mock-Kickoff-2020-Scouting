# Product Requirements Document (PRD)

## Project Name

Mock Kickoff 2020 Scouting - FRC Infinite Recharge Scouting App

## Overview

A web-based scouting application for the 2020-2021 FRC Infinite Recharge season that allows scouts to track robot performance during matches in real-time by pressing buttons corresponding to robot actions.

## Goals

- Enable scouts to efficiently track robot actions during matches
- Provide an intuitive button-based interface for quick data entry
- Collect comprehensive match data for analysis
- Export scouting data for further analysis

## Game Elements (FRC 2020 Infinite Recharge)

### Autonomous Period (15 seconds)
- **Initiation Line Cross**: 5 points
- **Bottom Port**: 2 points per power cell
- **Outer Port**: 4 points per power cell
- **Inner Port**: 6 points per power cell

### Teleop Period
- **Bottom Port**: 1 point per power cell
- **Outer Port**: 2 points per power cell
- **Inner Port**: 3 points per power cell
- **Rotation Control**: 10 points (spin control panel 3-5 times)
- **Position Control**: 20 points (align control panel to color)

### Endgame (last 30 seconds)
- **Park**: 5 points (robot in rendezvous point)
- **Hang**: 25 points (robot hanging on bar)
- **Level**: 15 points (switch balanced within 8 degrees)

## Features

### Match Setup
- Enter team number
- Enter match number
- Select alliance color (Red/Blue)
- Start match timer

### Action Tracking
- **Autonomous Actions**
  - Cross initiation line
  - Score in bottom/outer/inner port

- **Teleop Actions**
  - Pick up power cell
  - Score in bottom/outer/inner port
  - Rotation control (control panel)
  - Position control (control panel)

- **Endgame Actions**
  - Park
  - Hang/Climb
  - Level switch

- **Other Actions**
  - Defense played
  - Penalties/fouls
  - Robot disabled/breakdown

### Data Display
- Live score calculation
- Action counters
- Match timeline
- Notes section for qualitative observations

### Data Export
- Export match data as JSON
- Export match data as CSV
- Reset form for new match

## Technical Requirements

- HTML5/CSS3/JavaScript (vanilla)
- Responsive design for tablet use
- Field image integration
- Local storage for data persistence
- No backend required (client-side only)

## Success Metrics

- Quick data entry (< 1 second per action)
- Accurate score tracking
- Easy data export
- Intuitive UI requiring minimal training

# Celestial Time

Celestial Time is a Vedic astrology life-area tracker.

## Core model
- Sidereal/Lahiri-oriented architecture
- Maps all 12 houses to their planetary lords
- Treats the natal condition of each house lord as the baseline for that life area
- Tracks the same lord through current transits
- Adds Chara Karaka roles as a separate interpretation layer
- Collects Agree / Slightly agree / Slightly disagree / Disagree / Not applicable feedback

## Current build
This first build establishes the application architecture and a working interactive dashboard. The ephemeris adapter is intentionally isolated so a high-precision calculation backend can be connected without rewriting the interpretation and feedback layers.

## Development
```bash
npm install
npm run dev
```

# Hide from the Vortex

> 🌪️ Third Best Overall — MasseyHacks XII

A tornado evacuation demo app that shows you which nearby building to run to and how to get there, based on who you are and where you are.

---

## What it does

When the tornado simulation starts, the app:

- Scores a set of pre-selected houses by estimated age and structural safety
- Flags which buildings are safe to hide in vs ones to avoid
- Shows a live evacuation route to the best option
- Adjusts recommendations based on your personal profile — wheelchair users, elderly, children, and other mobility factors all affect the suggested path and score
- Sends your profile info and location to a simulated emergency contact list via the SOS page, displayed as Morse code

> **This is a demo.** It only works for a fixed set of 10 houses in the Ford City area of Windsor, Ontario. Building data is estimated, not pulled from a live source.

---

## Features

- **Tornado simulation** — animated tornado tracking along a preset path toward Windsor
- **Building safety scoring** — rates the 10 demo houses based on estimated age, distance to tornado, and structural integrity
- **Personalized routing** — factors in mobility type, age, height, weight, and travel mode
- **SOS page** — simulates sending your profile and location to emergency services via Morse code
- **Survivability score** — updates in real time as the tornado moves closer
- **Multi-language alert banner** — scrolls the warning in English, French, Arabic, Mandarin, Filipino, and Spanish

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/y41-y41/Hide_from_the_vortex.git
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default. 
sometimes it just goes to `http://localhost:5174` idk why it just does when it likes

---

## Known Issues

- Building coordinates occasionally redirect to Europe 
- Tornado path sometimes renders in France instead of the actual location
- Speed estimates become inaccurate for buildings older than 100 years

---

## What's next

- Real building data instead of hardcoded estimates
- Live weather API integration
- Support for any location, not just the demo area

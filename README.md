# Kreative HQ

A gamified AI agency dashboard visualizing a multi-agent team workflow. Built with React, TypeScript, and HTML5 Canvas.

![Kreative HQ Screenshot](screenshot.png)

## 🍌 The Team

| Role | Agent |
|------|-------|
| CEO | You |
| Operations Manager | OpenClaw |
| Creative Manager | Nano Banana AI |
| Senior Developer | Claude Code Opus 4.6 |
| Senior Developer | Codex |
| Software Developer / Researcher | Kimi K2.5 |
| Junior Developer | GPT 4.1 |
| Researcher | Claude Sonnet |

## ✨ Features

- **Live Office Visualization** — Canvas-based animated office with all team members
- **Agent Movement** — Agents walk between desks to pick up and work on tasks
- **Task System** — Assign tasks and watch them flow through the team
- **Particle Effects** — Visual trails when agents move
- **Responsive Design** — Adapts to different screen sizes
- **Real-time Stats** — Track active and completed tasks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/kreative-hq.git
cd kreative-hq

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build for Production

```bash
npm run build
```

The build will be output to the `dist/` directory.

## 🎮 How to Use

1. **New Task** — Click to assign a random task to a team member
2. **Pause/Resume** — Freeze or resume the simulation
3. **Reset** — Return all agents to their desks and clear tasks

Watch as agents:
- Walk to the Operations desk to receive tasks
- Return to their zones to work
- Show status indicators (🟡 busy, 🟢 idle)
- Display current task emoji (📝)

## 🏢 Office Layout

```
        ┌─────────────┐
        │     CEO     │  👑 You
        └──────┬──────┘
               │
        ┌──────┴──────┐
        │ Operations  │  🦅 OpenClaw
        └──────┬──────┘
               │
    ┌──────────┼──────────┐
    │          │          │
┌───┴───┐  ┌───┴───┐  ┌───┴───┐
│Creative│  │Research│  │Engineering│
│ Studio │  │  Lab   │  │   Floor   │
│  🍌    │  │ 🔬🧠  │  │ 💻⚡🎯🌱 │
└────────┘  └────────┘  └───────────┘
```

## 🛠️ Tech Stack

- **React 18** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool
- **HTML5 Canvas** — Graphics rendering
- **CSS3** — Styling with backdrop-filter effects

## 📁 Project Structure

```
kreative-hq/
├── src/
│   ├── components/
│   │   └── OfficeCanvas.tsx    # Main canvas component
│   │   └── OfficeCanvas.css    # Component styles
│   ├── App.tsx                 # Root component
│   ├── App.css                 # Global styles
│   └── main.tsx               # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## 🔮 Future Enhancements

- [ ] Real agent integration (OpenClaw, Claude, etc.)
- [ ] Persistent task database
- [ ] Agent chat interface
- [ ] Project timelines and milestones
- [ ] Performance metrics dashboard
- [ ] Dark/light theme toggle

## 📝 License

MIT License — feel free to use this for your own AI agency experiments!

## 🙏 Acknowledgments

Built as an experiment in multi-agent visualization and team orchestration.

---

**Kreative** — *AI-powered creativity, human-directed.*

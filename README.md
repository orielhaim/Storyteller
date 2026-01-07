# Storyteller

![License](https://img.shields.io/badge/license-GPLv3-blue.svg)
![Status](https://img.shields.io/badge/status-In%20Development-orange)
![Electron](https://img.shields.io/badge/Electron-v39+-informational)
![React](https://img.shields.io/badge/React-v19+-blue)

**The modern, open-source writing studio for authors.**

Storyteller is a powerful desktop application designed to replace the outdated interfaces of traditional writing software. It combines the distraction-free environment of a simple text editor with the complex world-building tools needed for full-length novels and series.

Built for the modern web era, it prioritizes user experience (UI/UX), speed, and complete customizability.

## ✨ Key Features

### 📚 Project Management
- **Series & Books:** Organize your work not just by chapters, but by entire series. Keep multiple books linked within the same context.
- **Hierarchy:** Drag-and-drop structure for Parts, Chapters, and Scenes.

### ✍️ The Editor
- **Rich Text Experience:** Offering a smooth, Notion-like writing experience without the lag.
- **Distraction-Free Mode:** Focus solely on your words when you need to.

### 🧩 Flexible Interface
- **Split View & Multi-Tab:** Open multiple scenes, character sheets, or notes side-by-side.
- **Customizable Layout:** Rearrange the workspace to fit your workflow. Keep your character list pinned to the right while writing on the left.

### 🌍 World Building
- **Character Database:** Detailed profiles for your cast. Track appearance, backstory, and relationships.
- **Locations & Items:** Manage the settings and important objects of your story.
- **Timeline:** (Coming Soon) Visual timeline to track events across your story's chronology.

---

## 🛠️ Tech Stack

Built with a focus on performance, maintainability, and a modern developer experience:

- **Core:** [Electron](https://www.electronjs.org/) (Desktop runtime)
- **Frontend:** [React](https://react.dev/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **UI Framework:** [Tailwind CSS](https://tailwindcss.com/)
- **Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Editor Engine:** [TipTap](https://tiptap.dev/)
- **Database:** [SQLite](https://www.sqlite.org/)
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)

---

## 🗺️ Roadmap

We are building this project in phases. Here is our current plan:

### Phase 1: Foundation 🏗️
- [X] Initialize Electron (electron-vite) + React + Tailwind CSS + Shadcn/ui.
- [X] Setup SQLite with Drizzle ORM connectivity (IPC communication).
- [X] Establish global state management with Zustand.

### Phase 2: Project Dashboard 📂
- [X] "Welcome" screen.
- [X] Ability to create/delete Books/Series.
- [X] Move Books between Series. (Drag-and-drop)
- [X] Series Management Page.

### Phase 3: The Core Editor 📝
- [ ] Basic Chapter/Scene list (Sidebar).
- [ ] Integration of TipTap editor.
- [ ] Autosave functionality to SQLite.
- [ ] Basic markdown formatting support.

### Phase 4: Interface & Layout 🖼️
- [ ] Implement Split-View architecture (open multiple tabs/panes).
- [ ] Draggable panels (resize sidebar/editor).
- [ ] Dark/Light mode toggle.

### Phase 5: World Building Modules 🧛‍♂️
- [ ] **Character Manager:** Create/Edit character profiles with custom fields.
- [ ] **Location Manager:** Basic location tracking.
- [ ] Side-by-side view: Open a character sheet while editing a chapter.

### Phase 6: Advanced Features 🚀
- [ ] Timeline view.
- [ ] Export to PDF/EPUB.
- [ ] Statistics (Word count, session tracking).

---

## 🚀 Getting Started

To run the project locally for development:

1.  **Clone the repo:**
    ```bash
    git clone https://github.com/orielhaim/storyteller.git
    cd storyteller
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Run the development server:**
    ```bash
    pnpm dev
    ```

---

## 🤝 Contributing

Contributions are welcome! Whether it's reporting bugs, suggesting features, or writing code. Please check the `CONTRIBUTING.md` (coming soon) for guidelines.

## 📄 License

This project is licensed under the **GPLv3 License** - see the [LICENSE](LICENSE) file for details. This ensures the software remains free and open-source for everyone, forever.
# 🗺️ Storyteller Roadmap

We are building this project in phases. Here is our detailed development plan:

## Phase 1: Foundation 🏗️
- [X] Initialize Electron (electron-vite) + React + Tailwind CSS + Shadcn/ui.
- [X] Setup SQLite with Drizzle ORM connectivity (IPC communication).
- [X] Establish global state management with Zustand.

## Phase 2: Project Dashboard 📂
- [X] "Welcome" screen.
- [X] Ability to create/delete Books/Series.
- [X] Move Books between Series. (Drag-and-drop)
- [X] Series Management Page.

## Phase 3: The Core Editor 📝

### Book Edit Page Architecture
- [X] **Book Entry Point**: Dedicated book editing workspace
- [X] **Book Settings**: Global book configuration (title, genre, target word count, synopsis)
- [X] **Characters Manager**: Hierarchical tree view of Characters
- [X] **World Manager**: worlds, locations, objects

### Writing Section (Dockview & react-arborist Integration)
- [X] **Chapter List Sidebar**: Hierarchical tree view of Chapters and Scenes
- [X] **Chapter and Scene Management**: Create, rename, reorder, delete chapters and scenes
- [X] **Drag-and-Drop Reorganization**: Move chapters and scenes between parts
- [ ] **Chapter Metadata**: Word count, last edited, status (draft/editing/revised)
- [ ] **Multiple Tabs**: Different tabs such as Characters, World, Locations, Objects, Notes, etc.

### Rich Text Editor (TipTap Integration)
- [X] **Core Editor Setup**: TipTap editor with real-time rendering
- [ ] **Full Formatting**: Bold, italic, underline, strikethrough, headings, lists, links, code blocks, blockquotes, etc.
- [ ] **Images**: Insert and edit images
- [ ] **Mentions**: Insert and edit mentions to characters, worlds, locations, objects
- [ ] **Autosave System**: Automatic saving to SQLite every 30 seconds
- [ ] **Revision History**: Basic undo/redo with draft snapshots

### Theme & Appearance
- [ ] **Dark/Light Mode Toggle**: System preference detection
- [ ] **Custom Themes**: User-defined color schemes
- [ ] **Font Customization**: Choose from web fonts and system fonts
- [ ] **Font Size & Line Height**: Adjustable reading preferences

### Notes System
- [ ] **Universal Notes**: Free-form note-taking for any purpose
- [ ] **Note Categories**: Organize notes by type (plot, research, ideas)
- [ ] **Note Linking**: Connect notes to chapters, characters, locations
- [ ] **Note Templates**: Pre-built templates for common note types
- [ ] **Rich Text Notes**: Full formatting support in notes
- [ ] **Note Attachments**: Link images, documents, or external resources

## Phase 4: Advanced Features 🚀

### Timeline & Plot Management
- [ ] **Visual Timeline**: Interactive timeline of story events
- [ ] **Multiple Timelines**: Parallel timelines, flashbacks, flash-forwards
- [ ] **Event Management**: Create, edit, and organize plot events
- [ ] **Character Arcs**: Track character development over time
- [ ] **Plot Threads**: Manage subplots and story threads
- [ ] **Timeline Export**: Share timeline as images or documents

### Collaboration Features (Future)
- [ ] **Multi-User Support**: Real-time collaboration
- [ ] **Version Control**: Git-like branching for story versions
- [ ] **Comments & Feedback**: Inline comments and suggestions
- [ ] **Role-Based Access**: Different permissions for editors/reviewers

### Export & Publishing
- [ ] **Multiple Formats**: Export to PDF, EPUB, DOCX, HTML
- [ ] **Custom Styling**: Apply themes and stylesheets to exports
- [ ] **Print Optimization**: Print-ready formatting
- [ ] **Batch Export**: Export entire books or selected chapters
- [ ] **Publishing Integration**: Direct upload to platforms

### Statistics & Analytics
- [ ] **Writing Statistics**: Word count, page count, writing speed
- [ ] **Session Tracking**: Daily/weekly/monthly writing sessions
- [ ] **Progress Visualization**: Charts and graphs of writing progress
- [ ] **Goal Setting**: Daily/weekly writing targets with notifications
- [ ] **Productivity Insights**: Writing patterns and peak productivity times

### Settings & Preferences
- [ ] **Global Settings**: Application-wide preferences
- [ ] **Book-Specific Settings**: Per-book configuration
- [ ] **Keyboard Shortcuts**: Customizable hotkeys
- [ ] **Backup & Sync**: Automatic backups and cloud synchronization
- [ ] **Import/Export Settings**: Transfer preferences between devices
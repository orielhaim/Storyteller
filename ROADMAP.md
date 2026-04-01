# Storyteller Roadmap

We are building this project in phases. Here is our detailed development plan:

## Phase 1: Project Dashboard
- [X] Ability to create/delete Books/Series.
- [X] Move Books between Series. (Drag-and-drop)
- [X] Series Management Page.

## Phase 2: The Main Workspace

### Book Edit Page Architecture
- [X] **Book Entry Point**: Dedicated book page
- [X] **Book Settings**: Global book configuration (title, genre, target word count, synopsis)
- [X] **Characters Manager**: Hierarchical tree view of Characters
- [X] **World Manager**: worlds, locations, objects

### Writing Workspace
- [X] **Content Tree Sidebar**: Hierarchical tree view of Chapters and Scenes and all other related content
- [X] **Chapter and Scene Management**: Create, rename, reorder, delete chapters and scenes
- [X] **Drag-and-Drop Reorganization**: Move chapters and scenes between parts
- [X] **Chapter Metadata**: Word count, last edited, status (draft/editing/revised/completed/future)
- [X] **Multiple Tabs**: Window based workspace for working on multiple things at once

### Rich Text Editor
- [X] **Core Editor Setup**: TipTap editor with real-time rendering
- [X] **Full Formatting**: Bold, italic, underline, strikethrough, headings, lists, links, code blocks, blockquotes, etc.
- [X] **Images**: Insert and edit images
- [ ] **Mentions**: Insert and edit mentions to characters, worlds, locations, objects
- [ ] **Revision History**: Basic undo/redo with draft snapshots
- [ ] **Vim Motions**: Vim-like motions for navigation and editing

## Phase 3: Quality of Life Features

### Auto Updates
- [X] **Auto Updates**: Automatically check for updates and installer (using github release)

### Settings & Preferences
- [X] **Updates**: Detailed update information and release notes
- [ ] **Dark/Light Mode Toggle**: System preference detection
- [ ] **Font and Text Customization**: Choose from web fonts and system fonts
- [X] **Global Settings**: Application-wide preferences
- [ ] **Keyboard Shortcuts**: Customizable hotkeys
- [X] **Backup & Sync**: Automatic backups
- [ ] **Import/Export Settings**: Transfer preferences between devices

### Notes System
- [ ] **Universal Notes**: Free-form note-taking for any purpose
- [ ] **Note Categories**: Organize notes by type (plot, research, ideas)
- [ ] **Note Linking**: Connect notes to chapters, characters, locations
- [ ] **Note Templates**: Pre-built templates for common note types
- [ ] **Rich Text Notes**: Full formatting support in notes
- [ ] **Note Attachments**: Link images, documents, or external resources

## Phase 4: Advanced Features

### Book Preview
- [X] **Page View**: Read-only paginated view
- [X] **Demo View**: Interactive flip-book view

### Statistics & Analytics
- [X] **Writing Statistics**: Word count, page count etc
- [ ] **Progress Visualization**: Charts and graphs of writing progress
- [ ] **Goal Setting**: Daily/weekly writing targets with notifications
- [ ] **Productivity Insights**: Writing patterns and peak productivity times

### Timeline & Plot Management
- [X] **Visual Timeline**: Interactive timeline of story events
- [ ] **Event Management**: Create, edit, and organize plot events
- [X] **Character Arcs**: Track character development over time
- [ ] **Plot Threads**: Manage subplots and story threads

### Collaboration Features (Future)
- [ ] **Multi-User Support**: Real-time collaboration
- [ ] **Version Control**: Git-like branching for story versions
- [ ] **Comments & Feedback**: Inline comments and suggestions

### Export & Publishing
- [X] **Multiple Formats**: Export to PDF, EPUB, DOCX, HTML, MD, TXT
- [ ] **Custom Styling**: Apply themes and stylesheets to exports
- [ ] **Print Optimization**: Print-ready formatting
- [X] **Batch Export**: Export entire books or selected chapters

### AI Features
- [ ] **Autocomplete**: AI-powered autocomplete in the editor
  - [ ] Context-aware suggestions
- [ ] **Super Agent**: An AI agent that can assist across the entire workspace
  - [ ] **Chat History**: Persistent conversation history and task continuity
  - [ ] **RAG**: Embedded context retrieval from all relevant project data
  - [ ] **Document Editing**: Ability to propose and apply changes to documents
    - [ ] Diff-based change preview
  - [ ] **Task Execution**: Can help plan, write, refactor, summarize, and organize work
  - [ ] **Search & Reasoning**: Can search across the entire project and answer based on combined context
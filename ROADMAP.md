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
- [ ] **Book Entry Point**: Dedicated book editing workspace accessible from project dashboard
- [ ] **Navigation Layout**: Three-panel layout (sidebar navigation, main editor area, context panel)
- [ ] **Book Settings**: Global book configuration (title, genre, target word count, synopsis)

### Chapter Editor
- [ ] **Chapter List Sidebar**: Hierarchical tree view of Parts → Chapters → Scenes
- [ ] **Chapter Management**: Create, rename, reorder, delete chapters
- [ ] **Scene Organization**: Sub-scenes within chapters for detailed outlining
- [ ] **Chapter Metadata**: Word count, last edited, status (draft/editing/revised)
- [ ] **Drag-and-Drop Reorganization**: Move chapters and scenes between parts

### Rich Text Editor (TipTap Integration)
- [ ] **Core Editor Setup**: TipTap editor with real-time rendering
- [ ] **Basic Formatting**: Bold, italic, underline, strikethrough
- [ ] **Headings & Structure**: H1-H6, blockquotes, code blocks
- [ ] **Lists**: Ordered and unordered lists with nesting
- [ ] **Links & Images**: Insert and edit hyperlinks, embed images
- [ ] **Autosave System**: Automatic saving to SQLite every 30 seconds
- [ ] **Revision History**: Basic undo/redo with draft snapshots

## Phase 4: Interface & Layout 🖼️

### Split-View Architecture
- [ ] **Multi-Tab System**: Open multiple chapters/scenes simultaneously
- [ ] **Split Panels**: Horizontal and vertical splits for side-by-side editing
- [ ] **Panel Management**: Resize, close, and rearrange editor panels
- [ ] **Tab Groups**: Organize related documents in tab groups

### Customizable Workspace
- [ ] **Layout Presets**: Save and restore workspace configurations
- [ ] **Panel Pinning**: Pin important panels (character list, outline)
- [ ] **Minimap**: Chapter overview and quick navigation
- [ ] **Fullscreen Mode**: Distraction-free writing environment

### Theme & Appearance
- [ ] **Dark/Light Mode Toggle**: System preference detection
- [ ] **Custom Themes**: User-defined color schemes
- [ ] **Font Customization**: Choose from web fonts and system fonts
- [ ] **Font Size & Line Height**: Adjustable reading preferences

## Phase 5: World Building Modules 🧛‍♂️

### Character Manager
- [ ] **Character Database**: Centralized character repository
- [ ] **Character Profiles**: Detailed forms for character information
  - Basic Info: Name, age, gender, occupation
  - Physical Description: Appearance, clothing, distinctive features
  - Personality: Traits, motivations, flaws, arc development
  - Relationships: Family, friends, enemies, romantic interests
  - Backstory: History, key events, secrets
- [ ] **Character Templates**: Pre-built templates for common archetypes
- [ ] **Custom Fields**: User-definable fields for specific world-building needs
- [ ] **Character Gallery**: Visual character cards with avatars
- [ ] **Character Search & Filter**: Find characters by various criteria

### Location Manager
- [ ] **Location Database**: Geographic and setting management
- [ ] **Location Profiles**: Detailed location information
  - Basic Info: Name, type, significance
  - Description: Visual details, atmosphere, sensory information
  - Geography: Maps, coordinates, climate, terrain
  - History: Key events, changes over time
  - Connections: Relationships to other locations
- [ ] **Location Hierarchy**: Organize locations by region/country/city
- [ ] **Location Maps**: Visual map integration with location markers
- [ ] **Travel Tracking**: Character movement between locations

### World Editor
- [ ] **World Overview**: Central hub for world-building elements
- [ ] **Timeline Integration**: Chronological events across the story world
- [ ] **World Rules & Laws**: Magic systems, physics, societal rules
- [ ] **Culture & Society**: Customs, traditions, social structures
- [ ] **Items & Artifacts**: Important objects with detailed descriptions
- [ ] **Factions & Organizations**: Groups, guilds, governments
- [ ] **Species & Races**: Non-human elements (fantasy/sci-fi)
- [ ] **Languages & Communication**: Constructed languages, dialects

### Notes System
- [ ] **Universal Notes**: Free-form note-taking for any purpose
- [ ] **Note Categories**: Organize notes by type (plot, research, ideas)
- [ ] **Note Linking**: Connect notes to chapters, characters, locations
- [ ] **Note Templates**: Pre-built templates for common note types
- [ ] **Rich Text Notes**: Full formatting support in notes
- [ ] **Note Attachments**: Link images, documents, or external resources

## Phase 6: Advanced Features 🚀

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
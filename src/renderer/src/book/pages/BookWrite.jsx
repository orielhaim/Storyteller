import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import FileTree from './writing/FileTree';
import DockviewManager from './writing/DockviewManager';
import ChaptersWindow from './writing/windows/ChaptersWindow';
import ScenesWindow from './writing/windows/ScenesWindow';
import SceneEditorWindow from './writing/windows/SceneEditorWindow';
import WorldDetail from './world/WorldDetail';
import LocationDetail from './world/LocationDetail';
import ObjectDetail from './world/ObjectDetail';
import CharacterProfile from './CharacterProfile';
import BookCharacters from './BookCharacters';
import BookWorld from './BookWorld';
import { useWritingStore } from '@/stores/writingStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useWorldStore } from '@/stores/worldStore';
import {
  Group as ResizablePanelGroup,
  Panel as ResizablePanel,
} from 'react-resizable-panels';

// --- Panel config map: single source of truth for all panel types ---
const PANEL_CONFIG = {
  main: {
    getPanel: (entity, bookId) => ({
      panelId: 'chapters-main',
      component: 'chapters',
      params: { bookId, title: 'Chapters' },
    }),
  },
  characters: {
    getPanel: (entity, bookId) => ({
      panelId: 'characters-main',
      component: 'characters',
      params: { bookId, title: 'Characters' },
    }),
  },
  'world-category': {
    getPanel: (entity, bookId) => ({
      panelId: 'world-main',
      component: 'world',
      params: { bookId, title: 'World Building' },
    }),
  },
  chapter: {
    getPanel: (entity, bookId) => ({
      panelId: `scenes-${entity.id}`,
      component: 'scenes',
      params: {
        chapterId: entity.id,
        bookId,
        chapterName: entity.name,
        title: entity.name || 'Scenes',
      },
    }),
    getDeletePanelId: (id) => `scenes-${id}`,
  },
  scene: {
    getPanel: (entity) => ({
      panelId: `scene-${entity.id}`,
      component: 'scene-editor',
      params: {
        sceneId: entity.id,
        sceneName: entity.name,
        title: entity.name || 'Scene Editor',
      },
    }),
    getDeletePanelId: (id) => `scene-${id}`,
  },
  character: {
    getPanel: (entity) => {
      const displayName = `${entity.firstName} ${entity.lastName || ''}`.trim() || 'Character Profile';
      return {
        panelId: `character-${entity.id}`,
        component: 'character-editor',
        params: {
          characterId: entity.id,
          characterName: displayName,
          title: displayName,
        },
      };
    },
    getDeletePanelId: (id) => `character-${id}`,
  },
  world: {
    getPanel: (entity) => ({
      panelId: `world-${entity.id}`,
      component: 'world-editor',
      params: {
        worldId: entity.id,
        worldName: entity.name,
        title: entity.name || 'World Detail',
      },
    }),
    getDeletePanelId: (id) => `world-${id}`,
  },
  location: {
    getPanel: (entity) => ({
      panelId: `location-${entity.id}`,
      component: 'location-editor',
      params: {
        locationId: entity.id,
        locationName: entity.name,
        title: entity.name || 'Location Detail',
      },
    }),
    getDeletePanelId: (id) => `location-${id}`,
  },
  object: {
    getPanel: (entity) => ({
      panelId: `object-${entity.id}`,
      component: 'object-editor',
      params: {
        objectId: entity.id,
        objectName: entity.name,
        title: entity.name || 'Object Detail',
      },
    }),
    getDeletePanelId: (id) => `object-${id}`,
  },
};

function BookWrite({ book }) {
  const dockviewRef = useRef(null);
  const [dockviewReady, setDockviewReady] = useState(false);
  const [workspaceState, setWorkspaceState] = useState(null);
  const [isWorkspaceLoaded, setIsWorkspaceLoaded] = useState(false);
  const panelLayoutRef = useRef(null);
  const { chapters, scenes } = useWritingStore();
  const { characters } = useCharacterStore();
  const { worlds, locations, objects } = useWorldStore();

  useEffect(() => {
    window.workspaceAPI.load(book.id).then((res) => {
      const state = res?.success ? res.data : null;
      setWorkspaceState(state);
      setIsWorkspaceLoaded(true);
    });
  }, [book.id]);

  const throttledSave = useRef(
    throttle((bookId, getDockviewLayout, panelLayout) => {
      const dockviewLayout = getDockviewLayout();
      if (!dockviewLayout) return;
      window.workspaceAPI.save(bookId, {
        dockviewLayout,
        panelLayout,
      });
    }, 500),
  ).current;

  useEffect(() => {
    return () => {
      throttledSave.flush();
    };
  }, [throttledSave]);

  const triggerSave = useCallback(() => {
    if (!dockviewRef.current) return;
    throttledSave(
      book.id,
      () => dockviewRef.current?.getLayout(),
      panelLayoutRef.current,
    );
  }, [book.id, throttledSave]);

  const handlePanelGroupLayoutChanged = useCallback(
    (layout) => {
      panelLayoutRef.current = layout;
      triggerSave();
    },
    [triggerSave],
  );

  const openPanel = useCallback(
    (type, entity) => {
      if (!dockviewRef.current) return;
      const config = PANEL_CONFIG[type];
      if (!config) {
        console.warn(`Unknown panel type: ${type}`);
        return;
      }
      const { panelId, component, params } = config.getPanel(entity, book.id);
      dockviewRef.current.addPanel(panelId, component, params);
    },
    [book.id],
  );

  const handleItemDeleted = useCallback((type, id) => {
    if (!dockviewRef.current) return;
    const config = PANEL_CONFIG[type];
    if (!config?.getDeletePanelId) return;
    dockviewRef.current.forceRemovePanel(config.getDeletePanelId(id));
  }, []);

  const entityLookup = useMemo(() => ({
    chapter: (id) => chapters.find((c) => c.id === id),
    scene: (id) => scenes.find((s) => s.id === id),
    character: (id) => characters.find((c) => c.id === id),
    world: (id) => worlds.find((w) => w.id === id),
    location: (id) => locations.find((l) => l.id === id),
    object: (id) => objects.find((o) => o.id === id),
  }), [chapters, scenes, characters, worlds, locations, objects]);

  const handleNodeClick = useCallback(
    (type, id) => {
      if (['main', 'characters', 'world-category'].includes(type)) {
        openPanel(type, {});
        return;
      }
      const lookup = entityLookup[type];
      const entity = lookup ? lookup(id) : { id };
      if (entity) {
        openPanel(type, entity);
      }
    },
    [openPanel, entityLookup],
  );

  const handleOpenChapter = useCallback((chapter) => openPanel('chapter', chapter), [openPanel]);
  const handleOpenScene = useCallback((scene) => openPanel('scene', scene), [openPanel]);
  const handleOpenCharacter = useCallback((character) => openPanel('character', character), [openPanel]);
  const handleOpenWorld = useCallback((world) => openPanel('world', world), [openPanel]);
  const handleOpenLocation = useCallback((location) => openPanel('location', location), [openPanel]);
  const handleOpenObject = useCallback((obj) => openPanel('object', obj), [openPanel]);

  const components = useMemo(
    () => ({
      chapters: (props) => (
        <ChaptersWindow
          bookId={props.params.bookId}
          onOpenChapter={handleOpenChapter}
        />
      ),
      characters: () => (
        <BookCharacters book={book} onOpenCharacter={handleOpenCharacter} />
      ),
      world: () => (
        <BookWorld
          book={book}
          onOpenWorld={handleOpenWorld}
          onOpenLocation={handleOpenLocation}
          onOpenObject={handleOpenObject}
          dockviewMode={true}
        />
      ),
      scenes: (props) => (
        <ScenesWindow
          chapterId={props.params.chapterId}
          bookId={props.params.bookId}
          chapterName={props.params.chapterName}
          onOpenScene={handleOpenScene}
        />
      ),
      'scene-editor': (props) => (
        <SceneEditorWindow
          sceneId={props.params.sceneId}
          sceneName={props.params.sceneName}
          onSceneDeleted={(sceneId) => handleItemDeleted('scene', sceneId)}
        />
      ),
      'character-editor': (props) => (
        <CharacterProfile
          characterId={props.params.characterId}
          onBack={() => {}}
          showBackButton={false}
        />
      ),
      'world-editor': (props) => (
        <WorldDetail
          worldId={props.params.worldId}
          onBack={() => {}}
          showBackButton={false}
        />
      ),
      'location-editor': (props) => (
        <LocationDetail
          locationId={props.params.locationId}
          onBack={() => {}}
          showBackButton={false}
        />
      ),
      'object-editor': (props) => (
        <ObjectDetail
          objectId={props.params.objectId}
          onBack={() => {}}
          showBackButton={false}
        />
      ),
    }),
    [
      book,
      handleOpenChapter,
      handleOpenScene,
      handleOpenCharacter,
      handleOpenWorld,
      handleOpenLocation,
      handleOpenObject,
      handleItemDeleted,
    ],
  );

  const handleDockviewReady = useCallback(() => {
    setDockviewReady(true);
  }, []);

  const initialDockviewLayout = workspaceState?.dockviewLayout ?? null;
  const initialPanelLayout = workspaceState?.panelLayout ?? undefined;

  useEffect(() => {
    if (dockviewReady && dockviewRef.current) {
      const hasPanels = dockviewRef.current.hasPanels();
      if (!hasPanels) {
        dockviewRef.current.addPanel('chapters-main', 'chapters', {
          bookId: book.id,
          title: 'Chapters',
        });
      }
    }
  }, [dockviewReady, book.id]);

  const handlePanelRemoved = useCallback(
    (remainingPanelCount) => {
      if (remainingPanelCount === 0 && dockviewRef.current) {
        dockviewRef.current.addPanel('chapters-main', 'chapters', {
          bookId: book.id,
          title: 'Chapters',
        });
      }
    },
    [book.id],
  );

  if (!isWorkspaceLoaded) return null;

  return (
    <ResizablePanelGroup
      direction="horizontal"
      id="book-write-panels"
      defaultLayout={initialPanelLayout}
      onLayoutChanged={handlePanelGroupLayoutChanged}
      style={{ height: '' }}
      className="h-[calc(100vh-4.5rem)]"
    >
      <ResizablePanel
        id="file-tree"
        minSize="150px"
        maxSize="300px"
        defaultSize="250px"
        collapsible
      >
        <FileTree
          bookId={book.id}
          onNodeClick={handleNodeClick}
          onItemDeleted={handleItemDeleted}
        />
      </ResizablePanel>
      <ResizablePanel id="main-content" className="overflow-hidden">
        <DockviewManager
          ref={dockviewRef}
          components={components}
          onReady={handleDockviewReady}
          onPanelRemoved={handlePanelRemoved}
          onLayoutChange={triggerSave}
          initialLayout={initialDockviewLayout}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default BookWrite;

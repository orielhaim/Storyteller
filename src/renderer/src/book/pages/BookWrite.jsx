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

  const handleItemDeleted = useCallback((type, id) => {
    if (!dockviewRef.current) return;

    if (type === 'chapter') {
      dockviewRef.current.forceRemovePanel(`scenes-${id}`);
    } else if (type === 'scene') {
      dockviewRef.current.forceRemovePanel(`scene-${id}`);
    } else if (type === 'character') {
      dockviewRef.current.forceRemovePanel(`character-${id}`);
    } else if (type === 'world') {
      dockviewRef.current.forceRemovePanel(`world-${id}`);
    } else if (type === 'location') {
      dockviewRef.current.forceRemovePanel(`location-${id}`);
    } else if (type === 'object') {
      dockviewRef.current.forceRemovePanel(`object-${id}`);
    }
  }, []);

  const handleNodeClick = useCallback(
    (type, id) => {
      if (!dockviewRef.current) return;

      if (type === 'main') {
        const panelId = 'chapters-main';
        dockviewRef.current.addPanel(panelId, 'chapters', {
          bookId: book.id,
          title: 'Chapters',
        });
      } else if (type === 'characters') {
        const panelId = 'characters-main';
        dockviewRef.current.addPanel(panelId, 'characters', {
          bookId: book.id,
          title: 'Characters',
        });
      } else if (type === 'world-category') {
        const panelId = 'world-main';
        dockviewRef.current.addPanel(panelId, 'world', {
          bookId: book.id,
          title: 'World Building',
        });
      } else if (type === 'chapter') {
        const chapter = chapters.find((c) => c.id === id);
        const panelId = `scenes-${id}`;
        dockviewRef.current.addPanel(panelId, 'scenes', {
          chapterId: id,
          bookId: book.id,
          chapterName: chapter?.name,
          title: chapter?.name || 'Scenes',
        });
      } else if (type === 'scene') {
        const scene = scenes.find((s) => s.id === id);
        const panelId = `scene-${id}`;
        dockviewRef.current.addPanel(panelId, 'scene-editor', {
          sceneId: id,
          sceneName: scene?.name,
          title: scene?.name || 'Scene Editor',
        });
      } else if (type === 'character') {
        const character = characters.find((c) => c.id === id);
        const panelId = `character-${id}`;
        dockviewRef.current.addPanel(panelId, 'character-editor', {
          characterId: id,
          characterName: character
            ? `${character.firstName} ${character.lastName || ''}`.trim()
            : 'Character Profile',
          title: character
            ? `${character.firstName} ${character.lastName || ''}`.trim()
            : 'Character Profile',
        });
      } else if (type === 'world') {
        const world = worlds.find((w) => w.id === id);
        const panelId = `world-${id}`;
        dockviewRef.current.addPanel(panelId, 'world-editor', {
          worldId: id,
          worldName: world?.name,
          title: world?.name || 'World Detail',
        });
      } else if (type === 'location') {
        const location = locations.find((l) => l.id === id);
        const panelId = `location-${id}`;
        dockviewRef.current.addPanel(panelId, 'location-editor', {
          locationId: id,
          locationName: location?.name,
          title: location?.name || 'Location Detail',
        });
      } else if (type === 'object') {
        const object = objects.find((o) => o.id === id);
        const panelId = `object-${id}`;
        dockviewRef.current.addPanel(panelId, 'object-editor', {
          objectId: id,
          objectName: object?.name,
          title: object?.name || 'Object Detail',
        });
      }
    },
    [book.id, chapters, scenes, characters, worlds, locations, objects],
  );

  const handleOpenChapter = useCallback(
    (chapter) => {
      if (!dockviewRef.current) return;
      const panelId = `scenes-${chapter.id}`;
      dockviewRef.current.addPanel(panelId, 'scenes', {
        chapterId: chapter.id,
        bookId: book.id,
        chapterName: chapter.name,
        title: chapter.name,
      });
    },
    [book.id],
  );

  const handleOpenScene = useCallback((scene) => {
    if (!dockviewRef.current) return;
    const panelId = `scene-${scene.id}`;
    dockviewRef.current.addPanel(panelId, 'scene-editor', {
      sceneId: scene.id,
      sceneName: scene.name,
      title: scene.name,
    });
  }, []);

  const handleOpenCharacter = useCallback((character) => {
    if (!dockviewRef.current) return;
    const panelId = `character-${character.id}`;
    dockviewRef.current.addPanel(panelId, 'character-editor', {
      characterId: character.id,
      characterName:
        `${character.firstName} ${character.lastName || ''}`.trim(),
      title: `${character.firstName} ${character.lastName || ''}`.trim(),
    });
  }, []);

  const handleOpenWorld = useCallback((world) => {
    if (!dockviewRef.current) return;
    const panelId = `world-${world.id}`;
    dockviewRef.current.addPanel(panelId, 'world-editor', {
      worldId: world.id,
      worldName: world.name,
      title: world.name,
    });
  }, []);

  const handleOpenLocation = useCallback((location) => {
    if (!dockviewRef.current) return;
    const panelId = `location-${location.id}`;
    dockviewRef.current.addPanel(panelId, 'location-editor', {
      locationId: location.id,
      locationName: location.name,
      title: location.name,
    });
  }, []);

  const handleOpenObject = useCallback((object) => {
    if (!dockviewRef.current) return;
    const panelId = `object-${object.id}`;
    dockviewRef.current.addPanel(panelId, 'object-editor', {
      objectId: object.id,
      objectName: object.name,
      title: object.name,
    });
  }, []);

  const components = useMemo(
    () => ({
      chapters: (props) => (
        <ChaptersWindow
          bookId={props.params.bookId}
          onOpenChapter={handleOpenChapter}
        />
      ),
      characters: (props) => (
        <BookCharacters book={book} onOpenCharacter={handleOpenCharacter} />
      ),
      world: (props) => (
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
          onBack={() => {}} // This will be handled by the dockview close mechanism
          showBackButton={false}
        />
      ),
      'world-editor': (props) => (
        <WorldDetail
          worldId={props.params.worldId}
          onBack={() => {}} // This will be handled by the dockview close mechanism
          showBackButton={false}
        />
      ),
      'location-editor': (props) => (
        <LocationDetail
          locationId={props.params.locationId}
          onBack={() => {}} // This will be handled by the dockview close mechanism
          showBackButton={false}
        />
      ),
      'object-editor': (props) => (
        <ObjectDetail
          objectId={props.params.objectId}
          onBack={() => {}} // This will be handled by the dockview close mechanism
          showBackButton={false}
        />
      ),
    }),
    [
      handleOpenChapter,
      handleOpenScene,
      handleOpenCharacter,
      handleOpenWorld,
      handleOpenLocation,
      handleOpenObject,
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

import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import FileTree from './writing/FileTree';
import DockviewManager from './writing/DockviewManager';
import ChaptersWindow from './writing/windows/ChaptersWindow';
import ScenesWindow from './writing/windows/ScenesWindow';
import SceneEditorWindow from './writing/windows/SceneEditorWindow';
import WorldDetail from './world/WorldDetail';
import LocationDetail from './world/LocationDetail';
import ObjectDetail from './world/ObjectDetail';
import CharacterProfile from './CharacterProfile';
import { useWritingStore } from '@/stores/writingStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useWorldStore } from '@/stores/worldStore';

function BookWrite({ book }) {
  const dockviewRef = useRef(null);
  const [dockviewReady, setDockviewReady] = useState(false);
  const { chapters, scenes } = useWritingStore();
  const { characters } = useCharacterStore();
  const { worlds, locations, objects } = useWorldStore();

  const handleNodeClick = useCallback((type, id, data) => {
    if (!dockviewRef.current) return;

    if (type === 'main') {
      const panelId = 'chapters-main';
      dockviewRef.current.addPanel(panelId, 'chapters', {
        bookId: book.id,
        title: 'Chapters',
      });
    } else if (type === 'chapter') {
      const chapter = chapters.find(c => c.id === id);
      const panelId = `scenes-${id}`;
      dockviewRef.current.addPanel(panelId, 'scenes', {
        chapterId: id,
        bookId: book.id,
        chapterName: chapter?.name,
        title: chapter?.name || 'Scenes',
      });
    } else if (type === 'scene') {
      const scene = scenes.find(s => s.id === id);
      const panelId = `scene-${id}`;
      dockviewRef.current.addPanel(panelId, 'scene-editor', {
        sceneId: id,
        sceneName: scene?.name,
        title: scene?.name || 'Scene Editor',
      });
    } else if (type === 'character') {
      const character = characters.find(c => c.id === id);
      const panelId = `character-${id}`;
      dockviewRef.current.addPanel(panelId, 'character-editor', {
        characterId: id,
        characterName: character ? `${character.firstName} ${character.lastName || ''}`.trim() : 'Character Profile',
        title: character ? `${character.firstName} ${character.lastName || ''}`.trim() : 'Character Profile',
      });
    } else if (type === 'world') {
      const world = worlds.find(w => w.id === id);
      const panelId = `world-${id}`;
      dockviewRef.current.addPanel(panelId, 'world-editor', {
        worldId: id,
        worldName: world?.name,
        title: world?.name || 'World Detail',
      });
    } else if (type === 'location') {
      const location = locations.find(l => l.id === id);
      const panelId = `location-${id}`;
      dockviewRef.current.addPanel(panelId, 'location-editor', {
        locationId: id,
        locationName: location?.name,
        title: location?.name || 'Location Detail',
      });
    } else if (type === 'object') {
      const object = objects.find(o => o.id === id);
      const panelId = `object-${id}`;
      dockviewRef.current.addPanel(panelId, 'object-editor', {
        objectId: id,
        objectName: object?.name,
        title: object?.name || 'Object Detail',
      });
    }
  }, [book.id, chapters, scenes, characters, worlds, locations, objects]);

  const handleOpenChapter = useCallback((chapter) => {
    if (!dockviewRef.current) return;
    const panelId = `scenes-${chapter.id}`;
    dockviewRef.current.addPanel(panelId, 'scenes', {
      chapterId: chapter.id,
      bookId: book.id,
      chapterName: chapter.name,
      title: chapter.name,
    });
  }, [book.id]);

  const handleOpenScene = useCallback((scene) => {
    if (!dockviewRef.current) return;
    const panelId = `scene-${scene.id}`;
    dockviewRef.current.addPanel(panelId, 'scene-editor', {
      sceneId: scene.id,
      sceneName: scene.name,
      title: scene.name,
    });
  }, []);

  const components = useMemo(() => ({
    chapters: (props) => (
      <ChaptersWindow
        bookId={props.params.bookId}
        onOpenChapter={handleOpenChapter}
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
      />
    ),
    'character-editor': (props) => (
      <CharacterProfile
        characterId={props.params.characterId}
        onBack={() => { }} // This will be handled by the dockview close mechanism
        showBackButton={false}
      />
    ),
    'world-editor': (props) => (
      <WorldDetail
        worldId={props.params.worldId}
        onBack={() => { }} // This will be handled by the dockview close mechanism
        showBackButton={false}
      />
    ),
    'location-editor': (props) => (
      <LocationDetail
        locationId={props.params.locationId}
        onBack={() => { }} // This will be handled by the dockview close mechanism
        showBackButton={false}
      />
    ),
    'object-editor': (props) => (
      <ObjectDetail
        objectId={props.params.objectId}
        onBack={() => { }} // This will be handled by the dockview close mechanism
        showBackButton={false}
      />
    ),
  }), [handleOpenChapter, handleOpenScene]);

  const handleDockviewReady = useCallback(() => {
    setDockviewReady(true);
  }, []);

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

  const handlePanelRemoved = useCallback((remainingPanelCount) => {
    if (remainingPanelCount === 0 && dockviewRef.current) {
      dockviewRef.current.addPanel('chapters-main', 'chapters', {
        bookId: book.id,
        title: 'Chapters',
      });
    }
  }, [book.id]);

  return (
    <div className="flex h-[calc(100vh-4.5rem)]">
      <div className="w-64 shrink-0">
        <FileTree bookId={book.id} onNodeClick={handleNodeClick} />
      </div>
      <div className="flex-1">
        <DockviewManager
          ref={dockviewRef}
          components={components}
          onReady={handleDockviewReady}
          onPanelRemoved={handlePanelRemoved}
        />
      </div>
    </div>
  );
}

export default BookWrite;
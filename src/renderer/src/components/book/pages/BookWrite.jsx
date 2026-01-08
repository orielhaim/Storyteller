import { useRef, useCallback, useMemo, useEffect, useState } from 'react';
import FileTree from './writing/FileTree';
import DockviewManager from './writing/DockviewManager';
import ChaptersWindow from './writing/windows/ChaptersWindow';
import ScenesWindow from './writing/windows/ScenesWindow';
import SceneEditorWindow from './writing/windows/SceneEditorWindow';
import { useWritingStore } from '@/stores/writingStore';

function BookWrite({ book }) {
  const dockviewRef = useRef(null);
  const [dockviewReady, setDockviewReady] = useState(false);
  const { chapters, scenes, fetchChapters } = useWritingStore();

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
    }
  }, [book.id, chapters, scenes]);

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
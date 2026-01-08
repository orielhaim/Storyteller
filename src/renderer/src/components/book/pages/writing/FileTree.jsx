import { useEffect, useMemo } from 'react';
import { Tree } from 'react-arborist';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { useWritingStore } from '@/stores/writingStore';
import { Folder, FileText, ChevronRight, ChevronDown, Book } from 'lucide-react';
import { cn } from '@/lib/utils';

function buildTreeData(bookId, chapters, scenes) {
  if (!bookId) return [];

  const validScenes = scenes.filter(scene => scene && typeof scene.chapterId === 'number');

  const scenesByChapter = validScenes.reduce((acc, scene) => {
    const chapterId = scene.chapterId;
    if (!acc[chapterId]) {
      acc[chapterId] = [];
    }
    acc[chapterId].push(scene);
    return acc;
  }, {});

  const chapterNodes = chapters.map((chapter) => {
    const chapterScenes = scenesByChapter[chapter.id] || [];
    return {
      id: `chapter-${chapter.id}`,
      name: chapter.name,
      type: 'chapter',
      entityId: chapter.id,
      children: chapterScenes.map((scene) => ({
        id: `scene-${scene.id}`,
        name: scene.name,
        type: 'scene',
        entityId: scene.id,
        parentId: chapter.id,
      })),
    };
  });

  return [{
    id: 'main',
    name: 'Main',
    type: 'main',
    entityId: null,
    isOpen: true,
    children: chapterNodes,
  }];
}

export default function FileTree({ bookId, onNodeClick }) {
  const { chapters, scenes, fetchChapters, fetchScenesByBook, reorderScenes, reorderChapters, moveSceneToChapter } = useWritingStore();

  useEffect(() => {
    if (!bookId) return;
    fetchChapters(bookId);
    fetchScenesByBook(bookId);
  }, [bookId, fetchChapters, fetchScenesByBook]);

  const treeData = useMemo(() => buildTreeData(bookId, chapters, scenes), [bookId, chapters, scenes]);

  const handleActivate = (node) => {
    if (!onNodeClick || !node?.data) return;

    onNodeClick(node.data.type, node.data.entityId, node.data);
  };

  const handleMove = async (args) => {
    const { dragNodes, parentNode, index } = args;

    if (dragNodes.length !== 1) return;

    const dragNode = dragNodes[0];
    const dragType = dragNode.data.type;
    const dragId = dragNode.data.entityId;

    try {
      if (dragType === 'chapter') {
        if (parentNode.data.type !== 'main') return;

        const chapterIds = chapters.map(c => c.id);
        const currentIndex = chapterIds.indexOf(dragId);

        if (currentIndex > -1) {
          chapterIds.splice(currentIndex, 1);
          chapterIds.splice(index, 0, dragId);
          await reorderChapters(bookId, chapterIds);
        }
      } else if (dragType === 'scene') {
        const currentChapterId = dragNode.data.parentId;

        let targetChapterId;
        if (parentNode.data.type === 'chapter') {
          targetChapterId = parentNode.data.entityId;
        } else if (parentNode.data.type === 'scene') {
          targetChapterId = parentNode.data.parentId;
        } else {
          return;
        }

        if (currentChapterId === targetChapterId) {
          const chapterScenes = scenes.filter(s => s.chapterId === targetChapterId);
          const sceneIds = chapterScenes.map(s => s.id);

          const currentIndex = sceneIds.indexOf(dragId);
          if (currentIndex > -1) {
            sceneIds.splice(currentIndex, 1);
          }

          sceneIds.splice(index, 0, dragId);

          await reorderScenes(targetChapterId, sceneIds);
        } else {
          await moveSceneToChapter(dragId, targetChapterId);
        }
      }
    } catch (error) {
      console.error('Failed to move item:', error);
    }
  };

  if (!bookId) return null;

  return (
    <div className="w-full bg-sidebar border-r border-border">
      <AutoSizer renderProp={({ width, height }) => (
          <Tree
            key={`tree-${bookId}-${treeData.length}`}
            data={treeData}
            width={width}
            height={height}
            indent={16}
            rowHeight={32}
            onActivate={handleActivate}
            onMove={handleMove}
            openByDefault={true}
            widthTerminator={width}
            disableDrag={(node) => node.data?.type === 'main'}
          >
            {NodeRenderer}
          </Tree>
        )}>

        
      </AutoSizer>
    </div>
  );
}

function NodeRenderer({ node, style, dragHandle, tree }) {
  const { type, name, children } = node.data;
  const isSelected = node.isSelected;
  const hasChildren = children && children.length > 0;
  const isFolder = hasChildren || !node.isLeaf;
  const isDraggable = type === 'scene' || type === 'chapter';
  const isDragging = node.isDragging;
  const isOver = node.isOver;
  const isOverParent = node.isOverParent;

  return (
    <div
      ref={dragHandle}
      style={style}
      draggable={isDraggable}
      className={cn(
        "flex items-center gap-1.5 px-2 py-0.5 text-sm transition-colors duration-100 select-none group outline-none",
        isSelected
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground hover:bg-sidebar-accent/50",
        isDraggable && "cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 bg-sidebar-accent/30",
        (isOver || isOverParent) && (type === 'chapter' || type === 'scene' || type === 'main') && "bg-blue-500/20 border-l-2 border-blue-500"
      )}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (type !== 'main') {
            node.toggle();
          }
        }}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm hover:bg-black/5 dark:hover:bg-white/10 transition-transform",
          (!hasChildren || type === 'main') && "opacity-0 pointer-events-none",
          hasChildren && type !== 'main' && "cursor-pointer"
        )}
      >
        {node.isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 opacity-70" />
        )}
      </div>

      <NodeIcon type={type} isOpen={node.isOpen} />

      <span className="truncate flex-1">{name}</span>
    </div>
  );
}

function NodeIcon({ type, isOpen }) {
  if (type === 'main') {
    return <Book className="h-4 w-4 shrink-0 text-primary" />;
  }

  if (type === 'chapter') {
    return (
      <Folder
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isOpen ? "text-blue-500 fill-blue-500/20" : "text-blue-500/80"
        )}
      />
    );
  }

  if (type === 'scene') {
    return <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  return <Book className="h-4 w-4 shrink-0" />;
}
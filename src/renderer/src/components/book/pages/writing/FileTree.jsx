import { useEffect, useMemo, useState } from 'react';
import { Tree } from 'react-arborist';
import { useWritingStore } from '@/stores/writingStore';
import { useCharacterStore } from '@/stores/characterStore';
import { useWorldStore } from '@/stores/worldStore';
import { Folder, FileText, ChevronRight, ChevronDown, Book, Users, User, Globe, MapPin, Package, Plus, Eye, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CreateCharacterDialog from '../dialogs/CreateCharacterDialog';
import CreateWorldDialog from '../dialogs/CreateWorldDialog';
import CreateLocationDialog from '../dialogs/CreateLocationDialog';
import CreateObjectDialog from '../dialogs/CreateObjectDialog';
import CreateSceneDialog from './dialogs/CreateSceneDialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function buildTreeData(bookId, chapters, scenes, characters, worlds, locations, objects) {
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

  // Group characters by role
  const charactersByRole = characters.reduce((acc, character) => {
    const role = character.role || 'unsorted';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(character);
    return acc;
  }, {});

  const roleLabels = {
    protagonist: 'Protagonists',
    supporting: 'Supporting Characters',
    antagonist: 'Antagonists',
    marginal: 'Marginal Characters',
    unsorted: 'Unsorted'
  };

  const roleOrder = ['protagonist', 'supporting', 'antagonist', 'marginal', 'unsorted'];

  const characterRoleNodes = roleOrder
    .filter(role => charactersByRole[role])
    .map((role) => ({
      id: `character-role-${role}`,
      name: roleLabels[role] || role,
      type: 'character-role',
      entityId: role,
      children: charactersByRole[role].map((character) => ({
        id: `character-${character.id}`,
        name: `${character.firstName} ${character.lastName || ''}`.trim(),
        type: 'character',
        entityId: character.id,
        role: role,
      })),
    }));

  // Create world subcategories
  const worldNodes = worlds.map((world) => ({
    id: `world-${world.id}`,
    name: world.name,
    type: 'world',
    entityId: world.id,
  }));

  const locationNodes = locations.map((location) => ({
    id: `location-${location.id}`,
    name: location.name,
    type: 'location',
    entityId: location.id,
  }));

  const objectNodes = objects.map((object) => ({
    id: `object-${object.id}`,
    name: object.name,
    type: 'object',
    entityId: object.id,
  }));

  const worldCategoryNodes = [
    {
      id: 'worlds',
      name: 'Worlds',
      type: 'worlds',
      entityId: null,
      children: worldNodes,
    },
    {
      id: 'locations',
      name: 'Locations',
      type: 'locations',
      entityId: null,
      children: locationNodes,
    },
    {
      id: 'world-objects',
      name: 'Objects',
      type: 'world-objects',
      entityId: null,
      children: objectNodes,
    },
  ];

  return [{
    id: 'main',
    name: 'Main',
    type: 'main',
    entityId: null,
    isOpen: true,
    children: chapterNodes,
  },
  {
    id: 'characters',
    name: 'Characters',
    type: 'characters',
    entityId: null,
    children: characterRoleNodes,
  },
  {
    id: 'world',
    name: 'World',
    type: 'world-category',
    entityId: null,
    children: worldCategoryNodes,
  }];
}

export default function FileTree({ bookId, onNodeClick, onItemDeleted }) {
  const { chapters, scenes, fetchChapters, fetchScenesByBook, reorderScenes, reorderChapters, moveSceneToChapter, deleteChapter, deleteScene } = useWritingStore();
  const { characters, fetchCharacters, createCharacter, deleteCharacter } = useCharacterStore();
  const { worlds, locations, objects, fetchWorlds, fetchLocations, fetchObjects, createWorld, createLocation, createObject, deleteWorld, deleteLocation, deleteObject } = useWorldStore();
  const [isCreateCharacterDialogOpen, setIsCreateCharacterDialogOpen] = useState(false);
  const [isCreateWorldDialogOpen, setIsCreateWorldDialogOpen] = useState(false);
  const [isCreateLocationDialogOpen, setIsCreateLocationDialogOpen] = useState(false);
  const [isCreateObjectDialogOpen, setIsCreateObjectDialogOpen] = useState(false);
  const [isCreateSceneDialogOpen, setIsCreateSceneDialogOpen] = useState(false);
  const [chapterIdForScene, setChapterIdForScene] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (!bookId) return;
    fetchChapters(bookId);
    fetchScenesByBook(bookId);
    fetchCharacters(bookId);
    fetchWorlds(bookId);
    fetchLocations(bookId);
    fetchObjects(bookId);
  }, [bookId, fetchChapters, fetchScenesByBook, fetchCharacters, fetchWorlds, fetchLocations, fetchObjects]);

  const treeData = useMemo(() => buildTreeData(bookId, chapters, scenes, characters, worlds, locations, objects), [bookId, chapters, scenes, characters, worlds, locations, objects]);

  const handleAddCharacter = () => {
    setIsCreateCharacterDialogOpen(true);
  };

  const handleCreateCharacter = async (characterData) => {
    try {
      await createCharacter(characterData);
      setIsCreateCharacterDialogOpen(false);
      // Refresh characters after creation
      fetchCharacters(bookId);
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  const handleAddWorld = () => {
    setIsCreateWorldDialogOpen(true);
  };

  const handleCreateWorld = async (worldData) => {
    try {
      await createWorld(worldData);
      setIsCreateWorldDialogOpen(false);
      // Refresh worlds after creation
      fetchWorlds(bookId);
    } catch (error) {
      console.error('Failed to create world:', error);
    }
  };

  const handleAddLocation = () => {
    setIsCreateLocationDialogOpen(true);
  };

  const handleCreateLocation = async (locationData) => {
    try {
      await createLocation(locationData);
      setIsCreateLocationDialogOpen(false);
      // Refresh locations after creation
      fetchLocations(bookId);
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  };

  const handleAddObject = () => {
    setIsCreateObjectDialogOpen(true);
  };

  const handleCreateObject = async (objectData) => {
    try {
      await createObject(objectData);
      setIsCreateObjectDialogOpen(false);
      // Refresh objects after creation
      fetchObjects(bookId);
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  const handleAddScene = (chapterId) => {
    setChapterIdForScene(chapterId);
    setIsCreateSceneDialogOpen(true);
  };

  const handleCreateScene = async () => {
    setIsCreateSceneDialogOpen(false);
    setChapterIdForScene(null);
    // Refresh scenes after creation
    fetchScenesByBook(bookId);
  };

  const getItemInfo = (type, entityId) => {
    switch (type) {
      case 'chapter':
        return {
          name: chapters.find(c => c.id === entityId)?.name || 'Chapter',
          displayType: 'chapter',
          deleteFunction: deleteChapter
        };
      case 'scene':
        return {
          name: scenes.find(s => s.id === entityId)?.name || 'Scene',
          displayType: 'scene',
          deleteFunction: deleteScene
        };
      case 'character':
        const character = characters.find(c => c.id === entityId);
        return {
          name: character ? `${character.firstName} ${character.lastName || ''}`.trim() : 'Character',
          displayType: 'character',
          deleteFunction: deleteCharacter
        };
      case 'world':
        return {
          name: worlds.find(w => w.id === entityId)?.name || 'World',
          displayType: 'world',
          deleteFunction: deleteWorld
        };
      case 'location':
        return {
          name: locations.find(l => l.id === entityId)?.name || 'Location',
          displayType: 'location',
          deleteFunction: deleteLocation
        };
      case 'object':
        return {
          name: objects.find(o => o.id === entityId)?.name || 'Object',
          displayType: 'object',
          deleteFunction: deleteObject
        };
      default:
        return null;
    }
  };

  const handleActivate = (node) => {
    if (!onNodeClick || !node?.data) return;

    onNodeClick(node.data.type, node.data.entityId, node.data);
  };

  const handleOpenItem = (node) => {
    handleActivate(node);
  };

  const handleDeleteItem = (node) => {
    const { type, entityId } = node.data;
    const itemInfo = getItemInfo(type, entityId);
    if (itemInfo) {
      setItemToDelete({ type, entityId, name: itemInfo.name, displayType: itemInfo.displayType, deleteFunction: itemInfo.deleteFunction });
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { type, entityId, deleteFunction } = itemToDelete;

      if (type === 'chapter') {
        await deleteFunction(entityId, bookId);
      } else if (type === 'scene') {
        const scene = scenes.find(s => s.id === entityId);
        await deleteFunction(entityId, scene?.chapterId, bookId);
      } else {
        await deleteFunction(entityId);
      }

      if (onItemDeleted) {
        onItemDeleted(type, entityId);
      }

      switch (type) {
        case 'chapter':
        case 'scene':
          fetchChapters(bookId);
          fetchScenesByBook(bookId);
          break;
        case 'character':
          fetchCharacters(bookId);
          break;
        case 'world':
          fetchWorlds(bookId);
          break;
        case 'location':
          fetchLocations(bookId);
          break;
        case 'object':
          fetchObjects(bookId);
          break;
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
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
    <div className="w-full bg-sidebar border-r border-border h-full">
      <Tree
        key={`tree-${bookId}-${treeData.length}`}
        data={treeData}
        width={"auto"}
        indent={16}
        rowHeight={32}
        onActivate={handleActivate}
        onMove={handleMove}
        openByDefault={true}
        disableDrag={(node) => node.data?.type === 'main' || node.data?.type === 'characters' || node.data?.type === 'character-role' || node.data?.type === 'world-category' || node.data?.type === 'worlds' || node.data?.type === 'locations' || node.data?.type === 'world-objects'}
      >
        {(nodeProps) => <NodeRenderer {...nodeProps} onAddCharacter={handleAddCharacter} onAddWorld={handleAddWorld} onAddLocation={handleAddLocation} onAddObject={handleAddObject} onAddScene={handleAddScene} onOpenItem={handleOpenItem} onDeleteItem={handleDeleteItem} />}
      </Tree>

      <CreateCharacterDialog
        bookId={bookId}
        isOpen={isCreateCharacterDialogOpen}
        onCreate={handleCreateCharacter}
        onClose={() => setIsCreateCharacterDialogOpen(false)}
      />

      <CreateWorldDialog
        bookId={bookId}
        isOpen={isCreateWorldDialogOpen}
        onCreate={handleCreateWorld}
        onClose={() => setIsCreateWorldDialogOpen(false)}
      />

      <CreateLocationDialog
        bookId={bookId}
        worlds={worlds}
        isOpen={isCreateLocationDialogOpen}
        onCreate={handleCreateLocation}
        onClose={() => setIsCreateLocationDialogOpen(false)}
      />

      <CreateObjectDialog
        bookId={bookId}
        isOpen={isCreateObjectDialogOpen}
        onCreate={handleCreateObject}
        onClose={() => setIsCreateObjectDialogOpen(false)}
      />

      <CreateSceneDialog
        chapterId={chapterIdForScene}
        bookId={bookId}
        open={isCreateSceneDialogOpen}
        onOpenChange={setIsCreateSceneDialogOpen}
        onCreate={handleCreateScene}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.displayType}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NodeRenderer({ node, style, dragHandle, tree, onAddCharacter, onAddWorld, onAddLocation, onAddObject, onAddScene, onOpenItem, onDeleteItem }) {
  const { type, name, children } = node.data;
  const isSelected = node.isSelected;
  const hasChildren = children && children.length > 0;
  const isFolder = hasChildren || !node.isLeaf;
  const isDraggable = type === 'scene' || type === 'chapter';
  const isDragging = node.isDragging;
  const isOver = node.isOver;
  const isOverParent = node.isOverParent;
  const canHaveContextMenu = ['chapter', 'scene', 'character', 'world', 'location', 'object'].includes(type);

  const nodeContent = (
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

      {type === 'chapter' && onAddScene && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddScene(node.data.entityId);
          }}
          className="ml-2 p-1 hover:bg-accent rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Add Scene"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {type === 'characters' && onAddCharacter && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddCharacter();
          }}
          className="ml-2 p-1 hover:bg-accent rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Add Character"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {type === 'worlds' && onAddWorld && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddWorld();
          }}
          className="ml-2 p-1 hover:bg-accent rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Add World"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {type === 'locations' && onAddLocation && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddLocation();
          }}
          className="ml-2 p-1 hover:bg-accent rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Add Location"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}

      {type === 'world-objects' && onAddObject && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddObject();
          }}
          className="ml-2 p-1 hover:bg-accent rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          title="Add Object"
        >
          <Plus className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (canHaveContextMenu) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {nodeContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onOpenItem(node)}>
            <Eye className="h-4 w-4 mr-2" />
            Open
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onDeleteItem(node)} variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return nodeContent;
}

function NodeIcon({ type, isOpen }) {
  if (type === 'main') {
    return <Book className="h-4 w-4 shrink-0 text-primary" />;
  }

  if (type === 'characters') {
    return <Users className="h-4 w-4 shrink-0 text-purple-500" />;
  }

  if (type === 'character-role') {
    return (
      <Folder
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isOpen ? "text-purple-500 fill-purple-500/20" : "text-purple-500/80"
        )}
      />
    );
  }

  if (type === 'character') {
    return <User className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  if (type === 'world-category') {
    return <Globe className="h-4 w-4 shrink-0 text-green-500" />;
  }

  if (type === 'worlds' || type === 'locations' || type === 'world-objects') {
    return (
      <Folder
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isOpen ? "text-green-500 fill-green-500/20" : "text-green-500/80"
        )}
      />
    );
  }

  if (type === 'world') {
    return <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  if (type === 'location') {
    return <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />;
  }

  if (type === 'object') {
    return <Package className="h-4 w-4 shrink-0 text-muted-foreground" />;
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

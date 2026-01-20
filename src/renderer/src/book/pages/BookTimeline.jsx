/* global bookAPI */
import {
  useState,
  useEffect,
  useRef,
  useTransition,
  use,
  Suspense,
} from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Loader2,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  Link2
} from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import { useWritingStore } from '@/stores/writingStore';
import Timeline from './timeline/Timeline.jsx';
import { cn } from '@/lib/utils';

const ROLE_CONFIG = {
  protagonist: { label: 'Protagonists', order: 1, color: 'amber' },
  supporting: { label: 'Supporting', order: 2, color: 'sky' },
  antagonist: { label: 'Antagonists', order: 3, color: 'rose' },
  marginal: { label: 'Marginal', order: 4, color: 'slate' },
  unsorted: { label: 'Unsorted', order: 5, color: 'gray' },
};

const TIMELINE_OPTIONS = {
  width: '100%',
  height: '600px',
  stack: true,
  showCurrentTime: true,
  zoomMin: 1000 * 60 * 60 * 24, // 1 day
  zoomMax: 1000 * 60 * 60 * 24 * 365 * 100, // 100 years
  orientation: 'top',
  editable: false,
  selectable: true,
  groupOrder: 'order',
  groupHeightMode: 'auto',
  margin: { item: { horizontal: 10, vertical: 5 } },
  tooltip: { followMouse: true, delay: 200 },
};

function normalizeDate(dateString, setToEndOfDay = false) {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;

    if (setToEndOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    return date;
  } catch {
    return null;
  }
}

function getCharacterFullName(character) {
  return `${character.firstName} ${character.lastName ?? ''}`.trim();
}

function createRelationshipKey(id1, id2) {
  return `${Math.min(id1, id2)}-${Math.max(id1, id2)}`;
}

const TimelineContentBuilders = {
  chapterGroup(chapter, sceneCount) {
    return `
      <div class="flex items-center justify-between w-full gap-3 px-3 py-2.5 bg-linear-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-200/60 rounded-xl shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center gap-2.5">
          <div class="w-2.5 h-2.5 bg-linear-to-br from-blue-500 to-indigo-600 rounded-full ring-2 ring-blue-200"></div>
          <span class="font-semibold text-sm text-blue-900 tracking-tight">${chapter.name}</span>
        </div>
        <span class="text-xs font-medium text-blue-700 bg-blue-100/80 px-2.5 py-1 rounded-full border border-blue-200/50">${sceneCount} scene${sceneCount !== 1 ? 's' : ''}</span>
      </div>
    `;
  },

  scenesSubgroup(chapterId) {
    return `
      <div class="flex items-center gap-2 ml-4 py-1">
        <div class="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
        <span class="text-xs font-medium text-blue-600/80 italic">Scenes</span>
      </div>
    `;
  },

  sceneItem(scene, chapter) {
    const chapterLabel = chapter ? `<span class="text-[10px] text-emerald-600 font-medium">${chapter.name}</span>` : '';
    return `
      <div class="flex items-center gap-2 px-2.5 py-1.5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-lg shadow-sm hover:shadow transition-shadow">
        <div class="w-2 h-2 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full shrink-0"></div>
        <div class="flex flex-col min-w-0">
          ${chapterLabel}
          <span class="text-xs font-semibold text-emerald-900 truncate">${scene.name}</span>
        </div>
      </div>
    `;
  },

  bookTimelineGroup(sceneCount) {
    return `
      <div class="flex items-center justify-between w-full gap-3 px-4 py-3 bg-linear-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/60 rounded-xl shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-4 h-4 bg-linear-to-br from-emerald-500 to-teal-600 rounded-full ring-2 ring-emerald-200 flex items-center justify-center">
            <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
          <span class="font-bold text-base text-emerald-900">Book Timeline</span>
        </div>
        <span class="text-sm font-medium text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200/50">${sceneCount} scene${sceneCount !== 1 ? 's' : ''}</span>
      </div>
    `;
  },

  characterGroup(name, avatarData) {
    const avatar = avatarData
      ? `<img src="${avatarData}" class="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" alt="${name}" />`
      : `<div class="w-9 h-9 rounded-full bg-linear-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600 ring-2 ring-white shadow-sm">${name.charAt(0).toUpperCase()}</div>`;

    return `
      <div class="flex items-center gap-2.5 py-1">
        ${avatar}
        <span class="font-medium text-sm text-slate-800">${name}</span>
      </div>
    `;
  },

  roleGroup(label, count) {
    return `
      <div class="font-semibold text-sm text-slate-700 flex items-center justify-between w-full gap-2 py-1">
        <span>${label}</span>
        <span class="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">${count}</span>
      </div>
    `;
  },

  charactersMainGroup(count) {
    return `
      <div class="font-semibold text-sm text-slate-700 flex items-center justify-between w-full gap-2 py-1.5">
        <span>Characters</span>
        <span class="text-xs bg-linear-to-r from-violet-100 to-purple-100 text-violet-700 px-2.5 py-1 rounded-full font-medium border border-violet-200/50">${count}</span>
      </div>
    `;
  },

  eventBirth(date, description) {
    return `
      <div class="p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 bg-linear-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
            <span class="text-sm">🎂</span>
          </div>
          <span class="font-semibold text-sky-900 text-sm">Birth</span>
        </div>
        <div class="text-xs text-sky-700 pl-9">
          <div class="font-medium">${date.toLocaleDateString()}</div>
          ${description ? `<div class="mt-1 text-sky-600/80 italic line-clamp-2">${description}</div>` : ''}
        </div>
      </div>
    `;
  },

  eventDeath(date, description) {
    return `
      <div class="p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 bg-linear-to-br from-rose-400 to-red-500 rounded-full flex items-center justify-center shadow-sm">
            <span class="text-sm">💀</span>
          </div>
          <span class="font-semibold text-rose-900 text-sm">Death</span>
        </div>
        <div class="text-xs text-rose-700 pl-9">
          <div class="font-medium">${date.toLocaleDateString()}</div>
          ${description ? `<div class="mt-1 text-rose-600/80 italic line-clamp-2">${description}</div>` : ''}
        </div>
      </div>
    `;
  },

  eventMarriage(relatedName, date) {
    return `
      <div class="p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 bg-linear-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-sm">
            <span class="text-sm">💍</span>
          </div>
          <span class="font-semibold text-pink-900 text-sm">Marriage</span>
        </div>
        <div class="text-xs text-pink-700 pl-9">
          <div class="font-medium">Married ${relatedName}</div>
          <div class="text-pink-600/80 mt-0.5">${date.toLocaleDateString()}</div>
        </div>
      </div>
    `;
  },

  eventEngagement(relatedName, date) {
    return `
      <div class="p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 bg-linear-to-br from-violet-400 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <span class="text-sm">💎</span>
          </div>
          <span class="font-semibold text-violet-900 text-sm">Engagement</span>
        </div>
        <div class="text-xs text-violet-700 pl-9">
          <div class="font-medium">Engaged to ${relatedName}</div>
          <div class="text-violet-600/80 mt-0.5">${date.toLocaleDateString()}</div>
        </div>
      </div>
    `;
  },

  eventChildBirth(childNames, date, description) {
    const isMultiple = childNames.length > 1;
    const namesDisplay = childNames.join(', ');

    return `
      <div class="p-2">
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-7 h-7 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-sm">
            <span class="text-sm">👶</span>
          </div>
          <span class="font-semibold text-green-900 text-sm">${isMultiple ? `${childNames.length} Children Born` : 'Child Born'}</span>
        </div>
        <div class="text-xs text-green-700 pl-9">
          <div class="font-medium">${namesDisplay}</div>
          <div class="text-green-600/80 mt-0.5">${date.toLocaleDateString()}</div>
          ${description && !isMultiple ? `<div class="mt-1 text-green-600/70 italic line-clamp-2">${description}</div>` : ''}
        </div>
      </div>
    `;
  },
};

function useCharacterImages(characters) {
  const [imageDataMap, setImageDataMap] = useState({});

  useEffect(() => {
    if (characters.length === 0) return;

    const controller = new AbortController();

    async function loadImages() {
      const charactersWithAvatars = characters.filter(c => c.avatar);

      const results = await Promise.allSettled(
        charactersWithAvatars.map(async (character) => {
          const result = await window.imageAPI.getData(character.avatar);
          if (result.success && result.data) {
            return { id: character.id, data: result.data };
          }
          return null;
        })
      );

      if (controller.signal.aborted) return;

      const imageMap = {};
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          imageMap[result.value.id] = result.value.data;
        }
      }
      setImageDataMap(imageMap);
    }

    loadImages();
    return () => controller.abort();
  }, [characters]);

  return imageDataMap;
}

function useRelationships(characters) {
  const [relationships, setRelationships] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (characters.length === 0) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchAllRelationships() {
      setIsLoading(true);
      const relsMap = {};

      const results = await Promise.allSettled(
        characters.map(async (character) => {
          const res = await bookAPI.characters.getRelationships(character.id);
          return { id: character.id, data: res.success ? res.data ?? [] : [] };
        })
      );

      if (controller.signal.aborted) return;

      for (const result of results) {
        if (result.status === 'fulfilled') {
          relsMap[result.value.id] = result.value.data;
        }
      }

      setRelationships(relsMap);
      setIsLoading(false);
    }

    fetchAllRelationships();
    return () => controller.abort();
  }, [characters]);

  return { relationships, isLoading };
}

function buildTimelineData(
  chapters,
  scenes,
  characters,
  relationships,
  imageDataMap,
  displayMode
) {
  const items = [];
  const groups = [];
  const characterMap = new Map(characters.map(c => [c.id, c]));
  const chapterMap = new Map(chapters.map(c => [c.id, c]));
  const processedRelationships = new Set();

  const scenesWithDates = scenes.filter(s => s.startDate || s.endDate);

  if (displayMode === 'separate') {
    buildSeparateBookTimeline(scenesWithDates, chapterMap, items, groups, chapters);
  } else {
    buildConnectedBookTimeline(scenesWithDates, chapterMap, items, groups);
  }

  buildCharacterGroups(characters, imageDataMap, groups);
  buildCharacterEvents(characters, characterMap, items);
  buildRelationshipEvents(relationships, characterMap, processedRelationships, items);
  buildParentChildEvents(relationships, characterMap, items);

  return { items, groups };
}

function buildSeparateBookTimeline(
  scenesWithDates,
  chapterMap,
  items,
  groups,
  chapters
) {
  const chaptersWithScenes = new Map();

  for (const scene of scenesWithDates) {
    if (!chaptersWithScenes.has(scene.chapterId)) {
      chaptersWithScenes.set(scene.chapterId, []);
    }
    chaptersWithScenes.get(scene.chapterId).push(scene);
  }

  const bookGroups = [];

  for (const [chapterId, chapterScenes] of chaptersWithScenes) {
    const chapter = chapterMap.get(chapterId);
    if (!chapter) continue;

    const chapterGroupId = `chapter-${chapterId}`;
    bookGroups.push(chapterGroupId);

    groups.push({
      id: chapterGroupId,
      content: TimelineContentBuilders.chapterGroup(chapter, chapterScenes.length),
      nestedGroups: [`scenes-${chapterId}`],
      showNested: true,
      order: 0,
    });

    groups.push({
      id: `scenes-${chapterId}`,
      content: TimelineContentBuilders.scenesSubgroup(chapterId),
      order: 0,
    });

    for (const scene of chapterScenes) {
      addSceneItem(scene, `scenes-${chapterId}`, chapter, items);
    }
  }

  if (bookGroups.length > 0) {
    groups.push({
      id: 'book-timeline',
      content: `
        <div class="flex items-center justify-between w-full gap-3 py-2">
          <span class="font-bold text-base text-slate-800">Book Timeline</span>
          <span class="text-sm font-medium text-blue-700 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">${chapters.length} Chapters</span>
        </div>
      `,
      nestedGroups: bookGroups,
      showNested: true,
      order: 0,
    });
  }
}

function buildConnectedBookTimeline(
  scenesWithDates,
  chapterMap,
  items,
  groups
) {
  const bookTimelineGroupId = 'book-timeline-connected';

  groups.push({
    id: bookTimelineGroupId,
    content: TimelineContentBuilders.bookTimelineGroup(scenesWithDates.length),
    order: 0,
  });

  for (const scene of scenesWithDates) {
    const chapter = chapterMap.get(scene.chapterId);
    if (!chapter) continue;
    addSceneItem(scene, bookTimelineGroupId, chapter, items, true);
  }
}

function addSceneItem(
  scene,
  groupId,
  chapter,
  items,
  includeChapter = false
) {
  const startDate = normalizeDate(scene.startDate);
  const endDate = normalizeDate(scene.endDate, true);
  const sceneContent = includeChapter
    ? TimelineContentBuilders.sceneItem(scene, chapter)
    : TimelineContentBuilders.sceneItem(scene);
  const title = `${scene.name} (${chapter.name})`;

  if (startDate && endDate) {
    items.push({
      id: `scene-${scene.id}`,
      group: groupId,
      start: startDate,
      end: endDate,
      content: sceneContent,
      title,
      className: 'scene-event',
    });
  } else {
    const pointDate = startDate ?? endDate;
    if (pointDate) {
      items.push({
        id: `scene-${scene.id}`,
        group: groupId,
        start: pointDate,
        type: 'point',
        content: sceneContent,
        title,
        className: 'scene-event',
      });
    }
  }
}

function buildCharacterGroups(
  characters,
  imageDataMap,
  groups
) {
  const charactersByRole = characters.reduce((acc, char) => {
    const role = char.role ?? 'marginal';
    (acc[role] ??= []).push(char);
    return acc;
  }, {});

  const roleGroups = [];

  for (const [roleKey, config] of Object.entries(ROLE_CONFIG)) {
    const roleCharacters = charactersByRole[roleKey] ?? [];
    if (roleCharacters.length === 0) continue;

    roleGroups.push(`role-${roleKey}`);

    groups.push({
      id: `role-${roleKey}`,
      content: TimelineContentBuilders.roleGroup(config.label, roleCharacters.length),
      nestedGroups: roleCharacters.map(c => c.id),
      showNested: true,
      order: config.order,
    });
  }

  if (roleGroups.length > 0) {
    groups.push({
      id: 'characters-group',
      content: TimelineContentBuilders.charactersMainGroup(characters.length),
      nestedGroups: roleGroups,
      showNested: true,
      order: 1,
    });
  }

  for (const character of characters) {
    const name = getCharacterFullName(character);
    groups.push({
      id: character.id,
      content: TimelineContentBuilders.characterGroup(name, imageDataMap[character.id]),
    });
  }
}

function buildCharacterEvents(
  characters,
  characterMap,
  items
) {
  for (const character of characters) {
    const name = getCharacterFullName(character);

    const birthDate = normalizeDate(character.attributes?.birthDate);
    if (birthDate) {
      items.push({
        id: `birth-${character.id}`,
        group: character.id,
        start: birthDate,
        type: 'point',
        content: TimelineContentBuilders.eventBirth(birthDate, character.description),
        title: `${name} was born on ${birthDate.toLocaleDateString()}`,
        className: 'birth-event',
      });
    }

    const deathDate = normalizeDate(character.attributes?.deathDate);
    if (deathDate) {
      items.push({
        id: `death-${character.id}`,
        group: character.id,
        start: deathDate,
        type: 'point',
        content: TimelineContentBuilders.eventDeath(deathDate, character.description),
        title: `${name} died on ${deathDate.toLocaleDateString()}`,
        className: 'death-event',
      });
    }
  }
}

function buildRelationshipEvents(
  relationships,
  characterMap,
  processedRelationships,
  items
) {
  for (const [characterIdStr, rels] of Object.entries(relationships)) {
    const characterId = parseInt(characterIdStr, 10);
    const character = characterMap.get(characterId);
    if (!character) continue;

    const characterName = getCharacterFullName(character);

    for (const rel of rels) {
      const relKey = createRelationshipKey(characterId, rel.relatedCharacterId);
      if (processedRelationships.has(relKey)) continue;
      processedRelationships.add(relKey);

      const relatedCharacter = characterMap.get(rel.relatedCharacterId);
      if (!relatedCharacter) continue;

      const relatedName = getCharacterFullName(relatedCharacter);

      if (rel.relationshipType === 'spouse' && rel.metadata?.marriageDate) {
        const date = normalizeDate(rel.metadata.marriageDate);
        if (date) {
          const content = TimelineContentBuilders.eventMarriage(relatedName, date);
          const reverseContent = TimelineContentBuilders.eventMarriage(characterName, date);

          items.push(
            {
              id: `marriage-${characterId}-${rel.relatedCharacterId}`,
              group: characterId,
              start: date,
              type: 'point',
              content,
              title: `${characterName} married ${relatedName} on ${date.toLocaleDateString()}`,
              className: 'marriage-event',
            },
            {
              id: `marriage-${rel.relatedCharacterId}-${characterId}`,
              group: rel.relatedCharacterId,
              start: date,
              type: 'point',
              content: reverseContent,
              title: `${relatedName} married ${characterName} on ${date.toLocaleDateString()}`,
              className: 'marriage-event',
            }
          );
        }
      }

      if (rel.relationshipType === 'engaged' && rel.metadata?.engagementDate) {
        const date = normalizeDate(rel.metadata.engagementDate);
        if (date) {
          const content = TimelineContentBuilders.eventEngagement(relatedName, date);
          const reverseContent = TimelineContentBuilders.eventEngagement(characterName, date);

          items.push(
            {
              id: `engagement-${characterId}-${rel.relatedCharacterId}`,
              group: characterId,
              start: date,
              type: 'point',
              content,
              title: `${characterName} engaged to ${relatedName} on ${date.toLocaleDateString()}`,
              className: 'engagement-event',
            },
            {
              id: `engagement-${rel.relatedCharacterId}-${characterId}`,
              group: rel.relatedCharacterId,
              start: date,
              type: 'point',
              content: reverseContent,
              title: `${relatedName} engaged to ${characterName} on ${date.toLocaleDateString()}`,
              className: 'engagement-event',
            }
          );
        }
      }
    }
  }
}

function buildParentChildEvents(
  relationships,
  characterMap,
  items
) {
  const parentChildEvents = new Map();

  for (const [characterIdStr, rels] of Object.entries(relationships)) {
    const childId = parseInt(characterIdStr, 10);
    const child = characterMap.get(childId);
    if (!child?.attributes?.birthDate) continue;

    const birthDate = normalizeDate(child.attributes.birthDate);
    if (!birthDate) continue;

    const dateKey = birthDate.toISOString().split('T')[0];

    for (const rel of rels) {
      if (rel.relationshipType !== 'parent') continue;

      const parentId = rel.relatedCharacterId;
      if (!characterMap.has(parentId)) continue;

      if (!parentChildEvents.has(parentId)) {
        parentChildEvents.set(parentId, new Map());
      }

      const dateMap = parentChildEvents.get(parentId);
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey).push(child);
    }
  }

  for (const [parentId, dateMap] of parentChildEvents) {
    const parent = characterMap.get(parentId);
    if (!parent) continue;

    const parentName = getCharacterFullName(parent);

    for (const [dateKey, children] of dateMap) {
      const date = normalizeDate(dateKey);
      if (!date) continue;

      const childNames = children.map(getCharacterFullName);
      const description = children.length === 1 ? children[0].description : undefined;

      items.push({
        id: children.length === 1
          ? `child-birth-${parentId}-${children[0].id}`
          : `children-birth-${parentId}-${dateKey}`,
        group: parentId,
        start: date,
        type: 'point',
        content: TimelineContentBuilders.eventChildBirth(childNames, date, description),
        title: `${childNames.join(', ')} born to ${parentName} on ${date.toLocaleDateString()}`,
        className: 'child-birth-event',
      });
    }
  }
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center space-y-4">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <div className="absolute inset-0 h-10 w-10 mx-auto rounded-full bg-primary/10 animate-ping" />
        </div>
        <p className="text-muted-foreground font-medium">Loading timeline data...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[600px]">
      <div className="text-center space-y-4 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
          <Calendar className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-foreground">No timeline data available</h3>
          <p className="text-sm text-muted-foreground">
            Add dates to character events or scene timings to see them visualized on the timeline.
          </p>
        </div>
      </div>
    </div>
  );
}

function TimelineControls({
  displayMode,
  onDisplayModeChange,
  onZoomIn,
  onZoomOut,
  onFit,
  hasItems,
  isPending,
  hasScenes,
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <h2 className="font-bold text-xl text-foreground tracking-tight">Timeline</h2>

        {hasScenes && (
          <div className="relative">
            <ToggleGroup
              type="single"
              value={displayMode}
              onValueChange={(value) => value && onDisplayModeChange(value)}
              className="bg-muted/50 p-1 rounded-lg border border-border/50"
            >
              <ToggleGroupItem
                value="separate"
                aria-label="Display chapters separately"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  "data-[state=on]:bg-background data-[state=on]:text-blue-600 data-[state=on]:shadow-sm",
                  "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
                )}
              >
                <Layers className="w-4 h-4 mr-1.5" />
                Separate
              </ToggleGroupItem>
              <ToggleGroupItem
                value="connected"
                aria-label="Display all scenes connected"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  "data-[state=on]:bg-background data-[state=on]:text-emerald-600 data-[state=on]:shadow-sm",
                  "data-[state=off]:text-muted-foreground data-[state=off]:hover:text-foreground"
                )}
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                Connected
              </ToggleGroupItem>
            </ToggleGroup>

            {isPending && (
              <div className="absolute -right-2 -top-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>

      {hasItems && (
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomIn}
            title="Zoom In"
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onZoomOut}
            title="Zoom Out"
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onFit}
            title="Fit to show all events"
            className="h-8 px-3"
          >
            <Maximize2 className="h-4 w-4 mr-1.5" />
            Fit All
          </Button>
        </div>
      )}
    </div>
  );
}

export default function BookTimeline({ book }) {
  const { characters, loading: charactersLoading, fetchCharacters } = useCharacterStore();
  const { chapters, scenes, fetchChapters, fetchScenesByBook } = useWritingStore();

  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [scenesLoading, setScenesLoading] = useState(true);
  const [displayMode, setDisplayMode] = useState('separate');
  const [isPending, startTransition] = useTransition();

  const timelineRef = useRef(null);

  const imageDataMap = useCharacterImages(characters);
  const { relationships, isLoading: relationshipsLoading } = useRelationships(characters);

  useEffect(() => {
    fetchCharacters(book.id);
  }, [book.id, fetchCharacters]);

  useEffect(() => {
    let isMounted = true;

    async function loadChapters() {
      setChaptersLoading(true);
      try {
        await fetchChapters(book.id);
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
      } finally {
        if (isMounted) setChaptersLoading(false);
      }
    }

    loadChapters();
    return () => { isMounted = false; };
  }, [book.id, fetchChapters]);

  useEffect(() => {
    let isMounted = true;

    async function loadScenes() {
      setScenesLoading(true);
      try {
        await fetchScenesByBook(book.id);
      } catch (error) {
        console.error('Failed to fetch scenes:', error);
      } finally {
        if (isMounted) setScenesLoading(false);
      }
    }

    loadScenes();
    return () => { isMounted = false; };
  }, [book.id, fetchScenesByBook]);

  const scenesWithDates = scenes.filter(s => s.startDate || s.endDate);
  const hasScenes = scenesWithDates.length > 0;

  const { items: timelineItems, groups: timelineGroups } = buildTimelineData(
    chapters,
    scenes,
    characters,
    relationships,
    imageDataMap,
    displayMode
  );

  const handleDisplayModeChange = (mode) => {
    startTransition(() => {
      setDisplayMode(mode);
    });
  };

  const handleFit = () => timelineRef.current?.fit();
  const handleZoomIn = () => timelineRef.current?.zoomIn();
  const handleZoomOut = () => timelineRef.current?.zoomOut();

  const isLoading = charactersLoading || relationshipsLoading || chaptersLoading || scenesLoading;

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-w-0 space-y-4">
      <TimelineControls
        displayMode={displayMode}
        onDisplayModeChange={handleDisplayModeChange}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFit={handleFit}
        hasItems={timelineItems.length > 0}
        isPending={isPending}
        hasScenes={hasScenes}
      />

      {timelineItems.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="h-[600px] rounded-lg border border-border/50 overflow-hidden bg-background">
          <Timeline
            ref={timelineRef}
            items={timelineItems}
            groups={timelineGroups}
            options={TIMELINE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}
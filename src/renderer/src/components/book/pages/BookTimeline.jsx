/* global bookAPI */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Loader2, Calendar, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import { useWritingStore } from '@/stores/writingStore';
import Timeline from './timeline/Timeline';

function BookTimeline({ book }) {
  const { characters, loading, fetchCharacters } = useCharacterStore();
  const { chapters, scenes, fetchChapters, fetchScenesByBook } = useWritingStore();
  const [relationships, setRelationships] = useState({});
  const [relationshipsLoading, setRelationshipsLoading] = useState(true);
  const [chaptersLoading, setChaptersLoading] = useState(true);
  const [scenesLoading, setScenesLoading] = useState(true);
  const [imageDataMap, setImageDataMap] = useState({});
  const [timelineDisplayMode, setTimelineDisplayMode] = useState('separate'); // 'separate' or 'connected'
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchCharacters(book.id);
  }, [book.id, fetchCharacters]);

  useEffect(() => {
    const loadChapters = async () => {
      setChaptersLoading(true);
      try {
        await fetchChapters(book.id);
      } catch (error) {
        console.error('Failed to fetch chapters:', error);
      } finally {
        setChaptersLoading(false);
      }
    };

    loadChapters();
  }, [book.id, fetchChapters]);

  useEffect(() => {
    const loadScenes = async () => {
      setScenesLoading(true);
      try {
        await fetchScenesByBook(book.id);
      } catch (error) {
        console.error('Failed to fetch scenes:', error);
      } finally {
        setScenesLoading(false);
      }
    };

    loadScenes();
  }, [book.id, fetchScenesByBook]);

  useEffect(() => {
    if (characters.length === 0) return;

    const loadImages = async () => {
      const imagePromises = characters
        .filter(c => c.avatar)
        .map(async (character) => {
          try {
            const result = await window.imageAPI.getData(character.avatar);
            if (result.success && result.data) {
              return { id: character.id, data: result.data };
            }
          } catch (error) {
            console.error(`Failed to load image for character ${character.id}:`, error);
          }
          return null;
        });

      const imageResults = await Promise.all(imagePromises);
      const imageMap = {};
      imageResults.forEach((result) => {
        if (result) {
          imageMap[result.id] = result.data;
        }
      });
      setImageDataMap(imageMap);
    };

    loadImages();
  }, [characters]);

  useEffect(() => {
    if (characters.length === 0) {
      setRelationshipsLoading(false);
      return;
    }

    const fetchAllRelationships = async () => {
      setRelationshipsLoading(true);
      const relsMap = {};

      try {
        await Promise.all(
          characters.map(async (character) => {
            try {
              const res = await bookAPI.characters.getRelationships(character.id);
              if (res.success) {
                relsMap[character.id] = res.data || [];
              }
            } catch (error) {
              console.error(`Failed to fetch relationships for character ${character.id}:`, error);
              relsMap[character.id] = [];
            }
          })
        );
        setRelationships(relsMap);
      } catch (error) {
        console.error('Failed to fetch relationships:', error);
      } finally {
        setRelationshipsLoading(false);
      }
    };

    fetchAllRelationships();
  }, [characters]);

  const { timelineItems, timelineGroups } = useMemo(() => {
    const items = [];
    const groups = [];
    const characterMap = new Map();
    const processedRelationships = new Set();

    // Book Timeline - Add above characters
    const bookGroups = [];
    const chapterMap = new Map();
    const sceneMap = new Map();

    // Create chapter and scene maps
    chapters.forEach(chapter => {
      chapterMap.set(chapter.id, chapter);
    });

    scenes.forEach(scene => {
      sceneMap.set(scene.id, scene);
    });

    // Filter scenes that have dates
    const scenesWithDates = scenes.filter(scene => scene.startDate || scene.endDate);

    if (timelineDisplayMode === 'separate') {
      // Separate mode: Group by chapters with beautiful HTML design
      const chaptersWithScenes = new Map();

      scenesWithDates.forEach(scene => {
        const chapterId = scene.chapterId;
        if (!chaptersWithScenes.has(chapterId)) {
          chaptersWithScenes.set(chapterId, []);
        }
        chaptersWithScenes.get(chapterId).push(scene);
      });

      chaptersWithScenes.forEach((chapterScenes, chapterId) => {
        const chapter = chapterMap.get(chapterId);
        if (!chapter) return;

        const chapterGroupId = `chapter-${chapterId}`;

        // Create nested group for chapter with enhanced design
        groups.push({
          id: chapterGroupId,
          content: `<div class="flex items-center justify-between w-full gap-3 p-2 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full shadow-sm"></div>
              <span class="font-bold text-sm text-blue-900">${chapter.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full border border-blue-200">${chapterScenes.length} scenes</span>
            </div>
          </div>`,
          nestedGroups: [`scenes-${chapterId}`],
          showNested: true,
          order: 0
        });

        // Create scenes group within chapter with enhanced design
        groups.push({
          id: `scenes-${chapterId}`,
          content: `<div class="flex items-center gap-2 ml-6 p-1">
            <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span class="text-xs font-medium text-blue-700 italic">Scenes</span>
          </div>`,
          order: 0
        });

        // Add scene items with enhanced design
        chapterScenes.forEach(scene => {
          const startDate = scene.startDate ? new Date(scene.startDate) : null;
          const endDate = scene.endDate ? new Date(scene.endDate) : null;

          if (startDate && endDate) {
            // Range item - set to full day
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            items.push({
              id: `scene-${scene.id}`,
              group: `scenes-${chapterId}`,
              start: startDate,
              end: endDate,
              content: `<div class="flex items-center gap-2 p-1 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                <div class="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                <span class="text-xs font-semibold text-blue-900 truncate">${scene.name}</span>
              </div>`,
              title: `${scene.name} (${chapter.name})`,
              className: 'scene-event',
            });
          } else if (startDate) {
            // Point item at start date - set to start of day
            startDate.setHours(0, 0, 0, 0);
            items.push({
              id: `scene-${scene.id}`,
              group: `scenes-${chapterId}`,
              start: startDate,
              type: 'point',
              content: `<div class="flex items-center gap-2 p-1 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                <div class="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                <span class="text-xs font-semibold text-blue-900 truncate">${scene.name}</span>
              </div>`,
              title: `${scene.name} (${chapter.name})`,
              className: 'scene-event',
            });
          } else if (endDate) {
            // Point item at end date - set to start of day
            endDate.setHours(0, 0, 0, 0);
            items.push({
              id: `scene-${scene.id}`,
              group: `scenes-${chapterId}`,
              start: endDate,
              type: 'point',
              content: `<div class="flex items-center gap-2 p-1 bg-blue-50 border border-blue-200 rounded-md shadow-sm">
                <div class="w-2 h-2 bg-blue-600 rounded-full shrink-0"></div>
                <span class="text-xs font-semibold text-blue-900 truncate">${scene.name}</span>
              </div>`,
              title: `${scene.name} (${chapter.name})`,
              className: 'scene-event',
            });
          }
        });

        bookGroups.push(chapterGroupId);
      });
    } else {
      // Connected mode: All scenes in one timeline - no nesting, just the main group
      const bookTimelineGroupId = 'book-timeline-connected';

      groups.push({
        id: bookTimelineGroupId,
        content: `<div class="flex items-center justify-between w-full gap-3 p-3 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg shadow-sm">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 bg-emerald-500 rounded-full shadow-sm flex items-center justify-center">
              <div class="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span class="font-bold text-base text-emerald-900">Book Timeline</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">${scenesWithDates.length} scenes</span>
          </div>
        </div>`,
        order: 0
      });

      // Add scene items with chapter and scene names - enhanced design
      scenesWithDates.forEach(scene => {
        const chapter = chapterMap.get(scene.chapterId);
        if (!chapter) return;

        const startDate = scene.startDate ? new Date(scene.startDate) : null;
        const endDate = scene.endDate ? new Date(scene.endDate) : null;

        const sceneContent = `${chapter.name}: ${scene.name}`;

        if (startDate && endDate) {
          // Range item - set to full day
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          items.push({
            id: `scene-${scene.id}`,
            group: bookTimelineGroupId,
            start: startDate,
            end: endDate,
            content: `<div class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm w-full">
              <div class="w-3 h-3 bg-emerald-600 rounded-full shrink-0"></div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-emerald-900">${chapter.name}</span>
                <span class="text-xs text-emerald-700">${scene.name}</span>
              </div>
            </div>`,
            title: sceneContent,
            className: 'scene-event',
          });
        } else if (startDate) {
          // Point item at start date - set to start of day
          startDate.setHours(0, 0, 0, 0);
          items.push({
            id: `scene-${scene.id}`,
            group: bookTimelineGroupId,
            start: startDate,
            type: 'point',
            content: `<div class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm">
              <div class="w-3 h-3 bg-emerald-600 rounded-full shrink-0"></div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-emerald-900">${chapter.name}</span>
                <span class="text-xs text-emerald-700">${scene.name}</span>
              </div>
            </div>`,
            title: sceneContent,
            className: 'scene-event',
          });
        } else if (endDate) {
          // Point item at end date - set to start of day
          endDate.setHours(0, 0, 0, 0);
          items.push({
            id: `scene-${scene.id}`,
            group: bookTimelineGroupId,
            start: endDate,
            type: 'point',
            content: `<div class="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-md shadow-sm">
              <div class="w-3 h-3 bg-emerald-600 rounded-full shrink-0"></div>
              <div class="flex flex-col">
                <span class="text-xs font-semibold text-emerald-900">${chapter.name}</span>
                <span class="text-xs text-emerald-700">${scene.name}</span>
              </div>
            </div>`,
            title: sceneContent,
            className: 'scene-event',
          });
        }
      });
    }

    // Add book timeline group if there are scenes
    if (timelineDisplayMode === 'separate' && bookGroups.length > 0) {
      groups.push({
        id: 'book-timeline',
        content: `<div class="flex items-center justify-between w-full gap-3">
          <div class="flex items-center gap-3">
            <span class="font-bold text-base">Book Timeline</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-blue-700 bg-blue-200 px-3 py-1 rounded-full border border-blue-300">${chapters.length} Chapters</span>
          </div>
        </div>`,
        nestedGroups: bookGroups,
        showNested: true,
        order: 0
      });
    }

    characters.forEach((character) => {
      characterMap.set(character.id, character);
    });


    const charactersByRole = characters.reduce((acc, character) => {
      const role = character.role || 'marginal';
      if (!acc[role]) acc[role] = [];
      acc[role].push(character);
      return acc;
    }, {});

    const roleConfig = {
      protagonist: { label: 'Protagonists', order: 1 },
      supporting: { label: 'Supporting Characters', order: 2 },
      antagonist: { label: 'Antagonists', order: 3 },
      marginal: { label: 'Marginal Characters', order: 4 }
    };

    const roleGroups = [];
    Object.entries(roleConfig).forEach(([roleKey, config]) => {
      const roleCharacters = charactersByRole[roleKey] || [];
      if (roleCharacters.length > 0) {
        roleGroups.push(`role-${roleKey}`);
        groups.push({
          id: `role-${roleKey}`,
          content: `<div class="font-semibold text-sm text-gray-700 flex items-center justify-between w-full gap-2">
            <span>${config.label}</span>
            <span class="text-xs bg-gray-200 px-2 py-1 rounded-full">${roleCharacters.length}</span>
          </div>`,
          nestedGroups: roleCharacters.map(char => char.id),
          showNested: true,
          order: config.order
        });
      }
    });

    if (roleGroups.length > 0) {
      groups.push({
        id: 'characters-group',
        content: `<div class="font-semibold text-sm text-gray-700 flex items-center justify-between w-full gap-2">
          <span>Characters</span>
          <span class="text-xs bg-green-200 px-2 py-1 rounded-full">${characters.length}</span>
        </div>`,
        nestedGroups: roleGroups,
        showNested: true,
        order: 1
      });
    }

    characters.forEach((character) => {
      const characterName = `${character.firstName} ${character.lastName || ''}`.trim();
      const avatarData = imageDataMap[character.id];

      const groupContent = avatarData
        ? `<div class="flex items-center gap-2">
            <img src="${avatarData}" class="w-8 h-8 rounded-full object-cover" alt="${characterName}" />
            <span class="font-medium text-sm">${characterName}</span>
          </div>`
        : `<div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
              ${characterName.charAt(0).toUpperCase()}
            </div>
            <span class="font-medium text-sm">${characterName}</span>
          </div>`;

      groups.push({
        id: character.id,
        content: groupContent,
      });

      const birthDate = character.attributes?.birthDate;
      if (birthDate) {
        try {
          const date = new Date(birthDate);
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) {
            const birthContent = `
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs">🎂</span>
                  </div>
                  <span class="font-semibold text-blue-900 text-sm">Birth</span>
                </div>
                <div class="text-xs text-blue-700">
                  <div class="text-blue-600">${date.toLocaleDateString()}</div>
                  ${character.description ? `<div class="mt-1 text-blue-500 italic">${character.description}</div>` : ''}
                </div>
              </div>
            `;

            items.push({
              id: `birth-${character.id}`,
              group: character.id,
              start: date,
              type: 'point',
              content: birthContent,
              title: `${characterName} was born on ${date.toLocaleDateString()}`,
              className: 'birth-event',
            });
          }
        } catch (error) {
          console.error(`Invalid date for character ${character.id}:`, birthDate);
        }
      }

      const deathDate = character.attributes?.deathDate;
      if (deathDate) {
        try {
          const date = new Date(deathDate);
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) {
            const deathContent = `
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <div class="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span class="text-white text-xs">💀</span>
                  </div>
                  <span class="font-semibold text-red-900 text-sm">Death</span>
                </div>
                <div class="text-xs text-red-700">
                  <div class="text-red-600">${date.toLocaleDateString()}</div>
                  ${character.description ? `<div class="mt-1 text-red-500 italic">${character.description}</div>` : ''}
                </div>
              </div>
            `;

            items.push({
              id: `death-${character.id}`,
              group: character.id,
              start: date,
              type: 'point',
              content: deathContent,
              title: `${characterName} died on ${date.toLocaleDateString()}`,
              className: 'death-event',
            });
          }
        } catch (error) {
          console.error(`Invalid death date for character ${character.id}:`, deathDate);
        }
      }
    });

    Object.entries(relationships).forEach(([characterId, rels]) => {
      rels.forEach((rel) => {
        const relKey = `${Math.min(parseInt(characterId), rel.relatedCharacterId)}-${Math.max(parseInt(characterId), rel.relatedCharacterId)}`;

        if (processedRelationships.has(relKey)) return;
        processedRelationships.add(relKey);

        const character = characterMap.get(parseInt(characterId));
        const relatedCharacter = characterMap.get(rel.relatedCharacterId);

        if (!character || !relatedCharacter) return;

        const characterName = `${character.firstName} ${character.lastName || ''}`.trim();
        const relatedName = `${relatedCharacter.firstName} ${relatedCharacter.lastName || ''}`.trim();

        if (rel.relationshipType === 'spouse' && rel.metadata?.marriageDate) {
          try {
            const date = new Date(rel.metadata.marriageDate);
            date.setHours(0, 0, 0, 0);
            if (!isNaN(date.getTime())) {
              const marriageContent = `
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">💍</span>
                    </div>
                    <span class="font-semibold text-pink-900 text-sm">Marriage</span>
                  </div>
                  <div class="text-xs text-pink-700">
                    <div class="text-pink-600">married ${relatedName}</div>
                    <div class="text-pink-500 mt-1">${date.toLocaleDateString()}</div>
                  </div>
                </div>
              `;

              items.push({
                id: `marriage-${characterId}-${rel.relatedCharacterId}`,
                group: parseInt(characterId),
                start: date,
                type: 'point',
                content: marriageContent,
                title: `${characterName} married ${relatedName} on ${date.toLocaleDateString()}`,
                className: 'marriage-event',
              });
              items.push({
                id: `marriage-${rel.relatedCharacterId}-${characterId}`,
                group: rel.relatedCharacterId,
                start: date,
                type: 'point',
                content: marriageContent,
                title: `${relatedName} married ${characterName} on ${date.toLocaleDateString()}`,
                className: 'marriage-event',
              });
            }
          } catch (error) {
            console.error(`Invalid marriage date:`, rel.metadata.marriageDate);
          }
        }

        if (rel.relationshipType === 'engaged' && rel.metadata?.engagementDate) {
          try {
            const date = new Date(rel.metadata.engagementDate);
            date.setHours(0, 0, 0, 0);
            if (!isNaN(date.getTime())) {
              const engagementContent = `
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">💎</span>
                    </div>
                    <span class="font-semibold text-purple-900 text-sm">Engagement</span>
                  </div>
                  <div class="text-xs text-purple-700">
                    <div class="text-purple-600">engaged to ${relatedName}</div>
                    <div class="text-purple-500 mt-1">${date.toLocaleDateString()}</div>
                  </div>
                </div>
              `;

              items.push({
                id: `engagement-${characterId}-${rel.relatedCharacterId}`,
                group: parseInt(characterId),
                start: date,
                type: 'point',
                content: engagementContent,
                title: `${characterName} engaged to ${relatedName} on ${date.toLocaleDateString()}`,
                className: 'engagement-event',
              });
              items.push({
                id: `engagement-${rel.relatedCharacterId}-${characterId}`,
                group: rel.relatedCharacterId,
                start: date,
                type: 'point',
                content: engagementContent,
                title: `${relatedName} engaged to ${characterName} on ${date.toLocaleDateString()}`,
                className: 'engagement-event',
              });
            }
          } catch (error) {
            console.error(`Invalid engagement date:`, rel.metadata.engagementDate);
          }
        }
      });
    });

    const parentChildEvents = new Map(); // Map of parentId -> Map of date -> children[]

    Object.entries(relationships).forEach(([characterIdStr, rels]) => {
      const childId = parseInt(characterIdStr);

      rels.forEach((rel) => {
        if (rel.relationshipType === 'parent') {
          const parent = characterMap.get(rel.relatedCharacterId);
          const child = characterMap.get(childId);

          if (!parent || !child) return;

          const childBirthDate = child.attributes?.birthDate;
          if (!childBirthDate) return;

          try {
            const date = new Date(childBirthDate);
            if (!isNaN(date.getTime())) {
              const dateKey = date.toISOString().split('T')[0];
              const parentId = rel.relatedCharacterId;

              if (!parentChildEvents.has(parentId)) {
                parentChildEvents.set(parentId, new Map());
              }

              const dateMap = parentChildEvents.get(parentId);
              if (!dateMap.has(dateKey)) {
                dateMap.set(dateKey, []);
              }

              dateMap.get(dateKey).push(child);
            }
          } catch (error) {
            console.error(`Invalid child birth date:`, childBirthDate);
          }
        }
      });
    });

    parentChildEvents.forEach((dateMap, parentId) => {
      const parent = characterMap.get(parentId);
      if (!parent) return;

      dateMap.forEach((children, dateKey) => {
        try {
          const date = new Date(dateKey);
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) {
            if (children.length === 1) {
              const child = children[0];
              const childName = `${child.firstName} ${child.lastName || ''}`.trim();
              const parentName = `${parent.firstName} ${parent.lastName || ''}`.trim();

              const childBirthContent = `
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">👶</span>
                    </div>
                    <span class="font-semibold text-green-900 text-sm">Child Born</span>
                  </div>
                  <div class="text-xs text-green-700">
                    <div class="text-green-600">${childName} Born</div>
                    <div class="text-green-500 mt-1">${date.toLocaleDateString()}</div>
                    ${child.description ? `<div class="mt-1 text-green-500 italic">${child.description}</div>` : ''}
                  </div>
                </div>
              `;

              items.push({
                id: `child-birth-${parentId}-${child.id}`,
                group: parentId,
                start: date,
                type: 'point',
                content: childBirthContent,
                title: `${childName} born to ${parentName} on ${date.toLocaleDateString()}`,
                className: 'child-birth-event',
              });
            } else {
              const childNames = children
                .map(c => `${c.firstName} ${c.lastName || ''}`.trim())
                .join(', ');
              const parentName = `${parent.firstName} ${parent.lastName || ''}`.trim();

              const multipleChildrenContent = `
                <div>
                  <div class="flex items-center gap-2 mb-2">
                    <div class="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span class="text-white text-xs">👶</span>
                    </div>
                    <span class="font-semibold text-green-900 text-sm">${children.length} Children Born</span>
                  </div>
                  <div class="text-xs text-green-700">
                    <div class="text-green-600">${childNames} Borns</div>
                    <div class="text-green-500 mt-1">${date.toLocaleDateString()}</div>
                  </div>
                </div>
              `;

              items.push({
                id: `children-birth-${parentId}-${dateKey}`,
                group: parentId,
                start: date,
                type: 'point',
                content: multipleChildrenContent,
                title: `${children.length} children born to ${parentName} on ${date.toLocaleDateString()}: ${childNames}`,
                className: 'child-birth-event',
              });
            }
          }
        } catch (error) {
          console.error(`Invalid date key:`, dateKey);
        }
      });
    });

    return { timelineItems: items, timelineGroups: groups };
  }, [chapters, scenes, characters, relationships, imageDataMap, timelineDisplayMode]);

  const timelineOptions = useMemo(() => ({
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
  }), []);

  const handleFit = () => {
    if (timelineRef.current) {
      timelineRef.current.fit();
    }
  };

  const handleZoomIn = () => {
    if (timelineRef.current) {
      timelineRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (timelineRef.current) {
      timelineRef.current.zoomOut();
    }
  };

  const isLoading = loading || relationshipsLoading || chaptersLoading || scenesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <h2 className="font-bold text-xl text-gray-800">Timeline</h2>
          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
            <ToggleGroup type="single" value={timelineDisplayMode} onValueChange={(value) => value && setTimelineDisplayMode(value)} className="bg-transparent">
              <ToggleGroupItem
                value="separate"
                aria-label="Display chapters separately"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=on]:bg-blue-500 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  Separate
                </div>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="connected"
                aria-label="Display all scenes connected"
                className="px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 data-[state=on]:bg-emerald-500 data-[state=on]:text-white data-[state=off]:text-gray-700 data-[state=off]:hover:bg-gray-200"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Connected
                </div>
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        {timelineItems.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleFit}
              title="Fit to show all events"
            >
              <Maximize2 className="h-4 w-4 mr-2" />
              Fit All
            </Button>
          </div>
        )}
      </div>
      {timelineItems.length === 0 ? (
        <div className="flex items-center justify-center h-[600px]">
          <div className="text-center space-y-2">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              No timeline data available
            </p>
            <p className="text-sm text-muted-foreground">
              Add dates to character events to see them on the timeline
            </p>
          </div>
        </div>
      ) : (
        <div className="h-[600px]">
          <Timeline
            ref={timelineRef}
            items={timelineItems}
            groups={timelineGroups}
            options={timelineOptions}
          />
        </div>
      )}
    </div>
  );
}

export default BookTimeline;
/* global bookAPI */
import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import Timeline from './timeline/Timeline';

function BookTimeline({ book }) {
  const { characters, loading, fetchCharacters } = useCharacterStore();
  const [relationships, setRelationships] = useState({});
  const [relationshipsLoading, setRelationshipsLoading] = useState(true);
  const [imageDataMap, setImageDataMap] = useState({});
  const timelineRef = useRef(null);

  useEffect(() => {
    fetchCharacters(book.id);
  }, [book.id, fetchCharacters]);

  // Load images for all characters
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

  // Fetch relationships for all characters
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

  // Transform characters and relationships into timeline format
  const { timelineItems, timelineGroups } = useMemo(() => {
    const items = [];
    const groups = [];
    const characterMap = new Map();
    const processedRelationships = new Set();

    // Create character map for quick lookup
    characters.forEach((character) => {
      characterMap.set(character.id, character);
    });

    // Group characters by role
    const charactersByRole = characters.reduce((acc, character) => {
      const role = character.role || 'marginal';
      if (!acc[role]) acc[role] = [];
      acc[role].push(character);
      return acc;
    }, {});

    // Role labels and order
    const roleConfig = {
      protagonist: { label: 'Protagonists', order: 1 },
      supporting: { label: 'Supporting Characters', order: 2 },
      antagonist: { label: 'Antagonists', order: 3 },
      marginal: { label: 'Marginal Characters', order: 4 }
    };

    // Create parent groups for roles
    Object.entries(roleConfig).forEach(([roleKey, config]) => {
      const roleCharacters = charactersByRole[roleKey] || [];
      if (roleCharacters.length > 0) {
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

    // Create character groups
    characters.forEach((character) => {
      const characterName = `${character.firstName} ${character.lastName || ''}`.trim();
      const avatarData = imageDataMap[character.id];

      // Create group with image
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

      // Add birth date event
      const birthDate = character.attributes?.birthDate;
      if (birthDate) {
        try {
          const date = new Date(birthDate);
          // Set to midnight to show only date, no time
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) {
            const birthContent = `
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm max-w-xs">
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

      // Add death date event
      const deathDate = character.attributes?.deathDate;
      if (deathDate) {
        try {
          const date = new Date(deathDate);
          // Set to midnight to show only date, no time
          date.setHours(0, 0, 0, 0);
          if (!isNaN(date.getTime())) {
            const deathContent = `
              <div class="bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm max-w-xs">
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

    // Process relationships for marriage/engagement events
    Object.entries(relationships).forEach(([characterId, rels]) => {
      rels.forEach((rel) => {
        const relKey = `${Math.min(parseInt(characterId), rel.relatedCharacterId)}-${Math.max(parseInt(characterId), rel.relatedCharacterId)}`;

        // Skip if already processed (relationships are bidirectional)
        if (processedRelationships.has(relKey)) return;
        processedRelationships.add(relKey);

        const character = characterMap.get(parseInt(characterId));
        const relatedCharacter = characterMap.get(rel.relatedCharacterId);

        if (!character || !relatedCharacter) return;

        const characterName = `${character.firstName} ${character.lastName || ''}`.trim();
        const relatedName = `${relatedCharacter.firstName} ${relatedCharacter.lastName || ''}`.trim();

        // Marriage events
        if (rel.relationshipType === 'spouse' && rel.metadata?.marriageDate) {
          try {
            const date = new Date(rel.metadata.marriageDate);
            // Set to midnight to show only date, no time
            date.setHours(0, 0, 0, 0);
            if (!isNaN(date.getTime())) {
              // Create marriage event content
              const marriageContent = `
                <div class="bg-pink-50 border border-pink-200 rounded-lg p-3 shadow-sm max-w-xs">
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

              // Add event for both characters
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

        // Engagement events
        if (rel.relationshipType === 'engaged' && rel.metadata?.engagementDate) {
          try {
            const date = new Date(rel.metadata.engagementDate);
            // Set to midnight to show only date, no time
            date.setHours(0, 0, 0, 0);
            if (!isNaN(date.getTime())) {
              // Create engagement event content
              const engagementContent = `
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-3 shadow-sm max-w-xs">
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
              // Single child
              const child = children[0];
              const childName = `${child.firstName} ${child.lastName || ''}`.trim();
              const parentName = `${parent.firstName} ${parent.lastName || ''}`.trim();

              const childBirthContent = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm max-w-xs">
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
              // Multiple children on same date
              const childNames = children
                .map(c => `${c.firstName} ${c.lastName || ''}`.trim())
                .join(', ');
              const parentName = `${parent.firstName} ${parent.lastName || ''}`.trim();

              const multipleChildrenContent = `
                <div class="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm max-w-xs">
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
  }, [characters, relationships, imageDataMap]);

  const timelineOptions = useMemo(() => ({
    width: '100%',
    height: '600px',
    stack: false,
    showCurrentTime: true,
    zoomMin: 1000 * 60 * 60 * 24, // 1 day
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 100, // 100 years
    orientation: 'top',
    editable: false,
    selectable: true,
    groupOrder: 'order', // Sort groups by their order property
    groupHeightMode: 'auto', // Auto height for groups to handle nested content properly
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

  const isLoading = loading || relationshipsLoading;

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
        <h2 className="font-semibold text-lg">Timeline</h2>
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
              No character dates available
            </p>
            <p className="text-sm text-muted-foreground">
              Add birth or death dates to characters to see them on the timeline
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

import { useState, useEffect, useTransition, useRef, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User, Plus, X, Save, ArrowLeft,
  Users, Wand2, Eye, Brain, Swords, MapPin, FileText, Edit3, Layout
} from 'lucide-react';
import { toast } from 'sonner';

import QuickStatsTab, { FIELDS as QUICK_STATS_FIELDS } from '@/book/pages/CharacterProfile/QuickStatsTab';
import AppearanceTab, { FIELDS as APPEARANCE_FIELDS } from '@/book/pages/CharacterProfile/AppearanceTab';
import PsychologyTab, { FIELDS as PSYCHOLOGY_FIELDS } from '@/book/pages/CharacterProfile/PsychologyTab';
import StoryTab, { FIELDS as STORY_FIELDS } from '@/book/pages/CharacterProfile/StoryTab';
import BackgroundTab, { FIELDS as BACKGROUND_FIELDS } from '@/book/pages/CharacterProfile/BackgroundTab';
import NotesTab, { FIELDS as NOTES_FIELDS } from '@/book/pages/CharacterProfile/NotesTab';
import RelationshipTab from '@/book/pages/CharacterProfile/RelationshipTab';
import CustomTab from '@/book/pages/CharacterProfile/CustomTab';

import CharacterProfileView from '@/book/pages/CharacterProfile/CharacterProfileView';

export const SECTIONS = {
  quickStats: {
    icon: Wand2,
    label: "Quick Stats",
    fields: QUICK_STATS_FIELDS
  },
  appearance: {
    icon: Eye,
    label: "Appearance",
    fields: APPEARANCE_FIELDS
  },
  psychology: {
    icon: Brain,
    label: "Psychology",
    fields: PSYCHOLOGY_FIELDS
  },
  story: {
    icon: Swords,
    label: "Story Arc",
    fields: STORY_FIELDS
  },
  background: {
    icon: MapPin,
    label: "Background",
    fields: BACKGROUND_FIELDS
  },
  notes: {
    icon: FileText,
    label: "Notes",
    fields: NOTES_FIELDS
  }
};

const EMPTY_ARRAY = [];

export default function CharacterProfile({ characterId, onBack, showBackButton = true }) {
  const fetchCharacter = useCharacterStore(state => state.fetchCharacter);
  const fetchCharacters = useCharacterStore(state => state.fetchCharacters);
  const updateCharacter = useCharacterStore(state => state.updateCharacter);
  const addRelationship = useCharacterStore(state => state.addRelationship);
  const updateRelationship = useCharacterStore(state => state.updateRelationship);
  const removeRelationship = useCharacterStore(state => state.removeRelationship);
  
  const characterFromStore = useCharacterStore(state => 
    state.characters.find(c => c.id === characterId)
  );
  
  const bookId = characterFromStore?.bookId;

  const relationshipsFromStore = useCharacterStore(state => 
    state.relationshipsByCharacter[characterId]
  );
  const relationships = relationshipsFromStore || EMPTY_ARRAY;

  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState(null);
  const [newGroup, setNewGroup] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const initialDataRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (characterId) fetchCharacter(characterId);
  }, [characterId, fetchCharacter]);

  useEffect(() => {
    if (bookId) fetchCharacters(bookId);
  }, [bookId, fetchCharacters]);

  useEffect(() => {
    if (!characterFromStore) return;

    const isNewCharacter = !formData || characterFromStore.id !== formData.id;
    

    if (isNewCharacter || (!isDirty && JSON.stringify(characterFromStore) !== initialDataRef.current)) {
      const data = JSON.parse(JSON.stringify(characterFromStore));
      if (!data.attributes) data.attributes = {};

      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
      setIsDirty(false);
    }
  }, [characterFromStore, isDirty, formData?.id]);

  const handleCoreChange = (field, value) => {
    const prev = formData;
    const next = { ...prev, [field]: value };

    updateAndDebounce(next);
  };

  const handleAttributeChange = (key, value) => {
    const prev = formData;
    const nextAttributes = { ...prev.attributes };
    if (value === undefined) {
      delete nextAttributes[key];
    } else {
      nextAttributes[key] = value;
    }

    const next = { ...prev, attributes: nextAttributes };
    updateAndDebounce(next);
  };

  const handleGroupAction = (action, value) => {
    const prev = formData;
    const groups = prev.groups || [];
    let newGroups;

    if (action === 'add' && value && !groups.includes(value)) {
      newGroups = [...groups, value];
    } else if (action === 'remove') {
      newGroups = groups.filter(g => g !== value);
    } else {
      return;
    }

    const next = { ...prev, groups: newGroups };
    updateAndDebounce(next);
  };

  const debouncedSave = useDebouncedCallback(async (dataToSave) => {
    if (!dataToSave) return;

    const formattedData = {
      ...dataToSave,
      first_name: dataToSave.firstName,
      last_name: dataToSave.lastName,
      gender: dataToSave.gender,
    };
    delete formattedData.firstName;
    delete formattedData.lastName;

    try {
      await updateCharacter(characterId, formattedData);
      initialDataRef.current = JSON.stringify(dataToSave);
      setIsDirty(false);
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }, 2000);

  const updateAndDebounce = (newData) => {
    setFormData(newData);
    setIsDirty(true);
    debouncedSave(newData);
  };

  const handleSave = () => {
    if (!isDirty) return;

    if (!formData.firstName?.trim()) {
      toast.error("First name is required");
      return;
    }

    startTransition(async () => {
      try {
        const dataToSave = {
          ...formData,
          first_name: formData.firstName,
          last_name: formData.lastName,
          gender: formData.gender,
        };
        delete dataToSave.firstName;
        delete dataToSave.lastName;

        await updateCharacter(characterId, dataToSave);
        initialDataRef.current = JSON.stringify(formData);
        setIsDirty(false);
        toast.success("Character saved successfully");
      } catch (error) {
        toast.error("Failed to save character");
        console.error(error);
      }
    });
  };

  if (!formData) {
    return (
      <div className="h-[50vh] flex items-center justify-center text-muted-foreground animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <User className="h-8 w-8 opacity-20" />
          <span>Summoning character details...</span>
        </div>
      </div>
    );
  }



  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto gap-4 px-4 overflow-y-auto">
      <header className="flex items-center justify-between py-2 border-b shrink-0">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              {(formData.firstName + ' ' + formData.lastName).trim() || 'Unnamed Character'}
              {isDirty && <span className="text-xs font-normal text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">Unsaved</span>}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2"
          >
            {isEditing ? (
              <><Layout className="h-4 w-4" /> View Mode</>
            ) : (
              <><Edit3 className="h-4 w-4" /> Edit Mode</>
            )}
          </Button>
          {isEditing && isDirty && (
            <Button
              onClick={handleSave}
              disabled={isPending}
              className="animate-in zoom-in-95 duration-200"
            >
              {isPending ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-col flex-1 min-h-0">
        {!isEditing ? (
          <CharacterProfileView formData={formData} relationships={relationships} />
        ) : (
          <div className="flex flex-col flex-1 min-h-0">
            <aside className="flex flex-col gap-6 shrink-0 overflow-y-auto pb-10">
              <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-6">
                  <div className="flex flex-row items-center gap-4">
                    <ImageUpload
                      value={formData.avatar}
                      onChange={(uuid) => handleCoreChange('avatar', uuid)}
                      className="w-52 h-64 shadow-lg rounded-lg object-cover"
                    />
                    <div className="w-full space-y-3">
                      <div className="flex flex-row gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="char-first-name">First Name</Label>
                          <Input
                            id="char-first-name"
                            value={formData.firstName || ''}
                            onChange={e => handleCoreChange('firstName', e.target.value)}
                            className="font-semibold text-lg"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="char-last-name">Last Name</Label>
                          <Input
                            id="char-last-name"
                            value={formData.lastName || ''}
                            onChange={e => handleCoreChange('lastName', e.target.value)}
                            className="font-semibold text-lg"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="char-description">Description</Label>
                        <Textarea
                          id="char-description"
                          value={formData.description || ''}
                          onChange={e => handleCoreChange('description', e.target.value)}
                          className="h-24"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label>Gender</Label>
                          <Select value={formData.gender || 'none'} onValueChange={v => handleCoreChange('gender', v === 'none' ? null : v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None / Unknown</SelectItem>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="unicorn">Unicorn</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Role</Label>
                          <Select value={formData.role || 'supporting'} onValueChange={v => handleCoreChange('role', v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="protagonist">Protagonist</SelectItem>
                              <SelectItem value="antagonist">Antagonist</SelectItem>
                              <SelectItem value="supporting">Supporting</SelectItem>
                              <SelectItem value="marginal">Marginal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Groups & Factions</Label>
                    <div className="flex flex-wrap gap-2">
                      {formData.groups?.map(group => (
                        <Badge key={group} variant="secondary" className="hover:bg-destructive/10 hover:text-destructive cursor-pointer group transition-colors" onClick={() => handleGroupAction('remove', group)}>
                          {group}
                          <X className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Badge>
                      ))}
                      <div className="flex items-center gap-1 w-full">
                        <Input
                          placeholder="Add group..."
                          className="h-8 text-xs"
                          value={newGroup}
                          onChange={e => setNewGroup(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              handleGroupAction('add', newGroup.trim());
                              setNewGroup('');
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            handleGroupAction('add', newGroup.trim());
                            setNewGroup('');
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <main className="flex-1 min-w-0 h-full flex flex-col">
              <Tabs defaultValue="quickStats" className="h-full flex flex-col">
                <div className="overflow-x-auto pb-2 shrink-0">
                  <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b rounded-none space-x-2">
                    {Object.entries(SECTIONS).map(([key, config]) => {
                      const IconComponent = config.icon;
                      return (
                        <TabsTrigger
                          key={key}
                          value={key}
                          className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-md px-4 py-2"
                        >
                          <IconComponent className="h-4 w-4 mr-2" />
                          {config.label}
                        </TabsTrigger>
                      );
                    })}
                    <TabsTrigger value="relationships" className="data-[state=active]:bg-secondary rounded-md px-4 py-2">
                      <Users className="h-4 w-4 mr-2" /> Relationships
                    </TabsTrigger>
                    <TabsTrigger value="custom" className="data-[state=active]:bg-secondary rounded-md px-4 py-2">
                      <Plus className="h-4 w-4 mr-2" /> Custom
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 relative mt-4">
                  <ScrollArea className="h-full pb-4">
                    <TabsContent value="quickStats" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <QuickStatsTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="appearance" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <AppearanceTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="psychology" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <PsychologyTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="story" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <StoryTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="background" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <BackgroundTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="notes" className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                      <NotesTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="custom" className="mt-0 animate-in fade-in-50">
                      <CustomTab attributes={formData.attributes} onChange={handleAttributeChange} />
                    </TabsContent>

                    <TabsContent value="relationships" className="mt-0 animate-in fade-in-50">
                      <RelationshipTab
                        characterId={characterId}
                        bookId={formData.bookId}
                        relationships={relationships}
                        onAdd={addRelationship}
                        onUpdate={updateRelationship}
                        onRemove={(id) => removeRelationship(id, characterId)}
                      />
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
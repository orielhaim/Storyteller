import { useState, useEffect, useTransition, useRef } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import ImageUpload from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Eye, Brain, Swords, MapPin, FileText, 
  Plus, X, Save, ArrowLeft, Trash2, Wand2 
} from 'lucide-react';
import { toast } from 'sonner'; // Assuming you use Sonner or similar for toasts

// --- Configuration ---
// This config drives the UI. Add a field here, and it appears in the form automatically.
const SECTIONS = {
  quickStats: {
    icon: Wand2,
    label: "Quick Stats",
    fields: [
      { key: 'age', label: 'Age', type: 'text', placeholder: '25', colSpan: 1 },
      { key: 'occupation', label: 'Occupation', type: 'text', placeholder: 'Warrior', colSpan: 1 },
      { key: 'birthDate', label: 'Birth Date', type: 'date', colSpan: 1 },
      { key: 'residence', label: 'Residence', type: 'text', placeholder: 'City name', colSpan: 1 },
    ]
  },
  appearance: {
    icon: Eye,
    label: "Appearance",
    fields: [
      { key: 'generalDescription', label: 'General Description', type: 'textarea', rows: 4, colSpan: 2 },
      { key: 'height', label: 'Height', type: 'text', placeholder: "6'2", colSpan: 1 },
      { key: 'weight', label: 'Weight', type: 'text', placeholder: "180 lbs", colSpan: 1 },
      { key: 'eyeColor', label: 'Eye Color', type: 'text', colSpan: 1 },
      { key: 'hairColor', label: 'Hair Color', type: 'text', colSpan: 1 },
      { key: 'distinguishingMarks', label: 'Distinguishing Marks', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'faceclaim', label: 'Faceclaim / Actor', type: 'text', colSpan: 2 },
    ]
  },
  psychology: {
    icon: Brain,
    label: "Psychology",
    fields: [
      { key: 'characterTraits', label: 'Traits (comma separated)', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'mbti', label: 'MBTI', type: 'text', placeholder: 'INTJ', colSpan: 1 },
      { key: 'enneagram', label: 'Enneagram', type: 'text', placeholder: 'Type 5', colSpan: 1 },
      { key: 'ghost', label: 'The Ghost (Past Trauma)', type: 'textarea', rows: 3, colSpan: 2 },
      { key: 'lie', label: 'The Lie (Self-Deception)', type: 'textarea', rows: 3, colSpan: 2 },
      { key: 'habits', label: 'Habits & Tics', type: 'textarea', rows: 2, colSpan: 2 },
    ]
  },
  story: {
    icon: Swords,
    label: "Story Arc",
    fields: [
      { key: 'goal', label: 'Goal', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'motivation', label: 'Motivation', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'obstacle', label: 'Obstacle', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'development', label: 'Character Arc/Development', type: 'textarea', rows: 4, colSpan: 2 },
    ]
  },
  background: {
    icon: MapPin,
    label: "Background",
    fields: [
      { key: 'birthPlace', label: 'Place of Birth', type: 'text', colSpan: 1 },
      { key: 'family', label: 'Family & Relations', type: 'textarea', rows: 2, colSpan: 2 },
      { key: 'history', label: 'Biography', type: 'textarea', rows: 5, colSpan: 2 },
      { key: 'secrets', label: 'Secrets', type: 'textarea', rows: 3, colSpan: 2 },
    ]
  },
  notes: {
    icon: FileText,
    label: "Notes",
    fields: [
      { key: 'freeNotes', label: 'Free Notes', type: 'textarea', rows: 10, colSpan: 2 },
    ]
  }
};

// Helper to extract all known keys from config to filter custom fields later
const KNOWN_KEYS = new Set(Object.values(SECTIONS).flatMap(s => s.fields.map(f => f.key)));

// --- Components ---

const FormField = ({ config, value, onChange }) => {
  const Component = config.type === 'textarea' ? Textarea : Input;
  
  return (
    <div className={`space-y-2 ${config.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}>
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {config.label}
      </Label>
      <Component 
        value={value || ''} 
        onChange={e => onChange(config.key, e.target.value)}
        placeholder={config.placeholder}
        type={config.type === 'date' ? 'date' : 'text'}
        rows={config.rows}
        className="bg-card/50 focus:bg-background transition-colors"
      />
    </div>
  );
};

const DynamicFieldEditor = ({ attributes, onChange }) => {
  const [newKey, setNewKey] = useState('');
  
  // Filter out keys that are already handled by the main UI sections
  const customEntries = Object.entries(attributes).filter(([key]) => !KNOWN_KEYS.has(key));

  const addField = () => {
    if (newKey && !attributes[newKey]) {
      onChange(newKey, '');
      setNewKey('');
    }
  };

  const removeField = (key) => {
    const next = { ...attributes };
    delete next[key];
    // We pass the full new object back up implies the parent handles the merge/replace
    // But since our parent handler expects (key, value), we need a specific "delete" signal or logic.
    // For simplicity in this architecture, we'll expose a specific delete handler in parent or use null.
    // Let's assume the parent handles `undefined` as delete.
    onChange(key, undefined); 
  };

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">Custom Attributes</CardTitle>
        <CardDescription>Track inventory, magical stats, or system-specific data.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input 
            value={newKey} 
            onChange={e => setNewKey(e.target.value)} 
            placeholder="New attribute name (e.g. Mana)"
            className="font-mono text-sm"
          />
          <Button onClick={addField} variant="secondary" size="sm">
            <Plus className="h-4 w-4 mr-2" /> Add
          </Button>
        </div>

        <div className="space-y-2">
          {customEntries.map(([key, value]) => (
            <div key={key} className="flex items-start gap-2 group">
              <div className="w-1/3 min-w-[120px] pt-2">
                 <Badge variant="outline" className="font-mono text-xs">{key}</Badge>
              </div>
              <Textarea 
                value={value} 
                onChange={e => onChange(key, e.target.value)}
                className="flex-1 min-h-10 py-2"
                rows={1}
              />
              <Button 
                onClick={() => removeField(key)} 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {customEntries.length === 0 && (
            <div className="text-sm text-muted-foreground italic text-center py-4">
              No custom fields added yet.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// --- Main Component ---

export default function CharacterProfile({ characterId, onBack, showBackButton = true }) {
  const { currentCharacter, fetchCharacter, updateCharacter } = useCharacterStore();
  
  // React 19: useTransition for smooth optimistic UI
  const [isPending, startTransition] = useTransition();
  
  // Local state
  const [formData, setFormData] = useState(null);
  const [newGroup, setNewGroup] = useState('');
  
  // Refs for dirty checking
  const initialDataRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);

  // 1. Load Data
  useEffect(() => {
    if (characterId) fetchCharacter(characterId);
  }, [characterId, fetchCharacter]);

  // 2. Sync State when store loads
  useEffect(() => {
    if (currentCharacter && (!formData || currentCharacter.id !== formData.id)) {
      const data = JSON.parse(JSON.stringify(currentCharacter));
      // Ensure attributes object exists
      if (!data.attributes) data.attributes = {};
      
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
      setIsDirty(false);
    }
  }, [currentCharacter]);

  // 3. Handlers
  const handleCoreChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      setIsDirty(JSON.stringify(next) !== initialDataRef.current);
      return next;
    });
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => {
      const nextAttributes = { ...prev.attributes };
      if (value === undefined) {
        delete nextAttributes[key];
      } else {
        nextAttributes[key] = value;
      }
      const next = { ...prev, attributes: nextAttributes };
      setIsDirty(JSON.stringify(next) !== initialDataRef.current);
      return next;
    });
  };

  const handleGroupAction = (action, value) => {
    setFormData(prev => {
      const groups = prev.groups || [];
      let newGroups;
      
      if (action === 'add' && value && !groups.includes(value)) {
        newGroups = [...groups, value];
      } else if (action === 'remove') {
        newGroups = groups.filter(g => g !== value);
      } else {
        return prev;
      }

      const next = { ...prev, groups: newGroups };
      setIsDirty(JSON.stringify(next) !== initialDataRef.current);
      return next;
    });
  };

  const handleSave = () => {
    if (!isDirty) return;

    // Validate that first name is not empty
    if (!formData.firstName?.trim()) {
      toast.error("First name is required");
      return;
    }

    startTransition(async () => {
      try {
        // Transform camelCase to snake_case for backend compatibility
        const dataToSave = {
          ...formData,
          first_name: formData.firstName,
          last_name: formData.lastName,
        };
        // Remove camelCase versions to avoid confusion
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
    <div className="flex flex-col h-[calc(100vh-2rem)] max-w-7xl mx-auto gap-4 px-4 overflow-y-auto">
      {/* Header */}
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
        <Button 
          onClick={handleSave} 
          disabled={!isDirty || isPending}
          className={isDirty ? "animate-in zoom-in-95 duration-200" : ""}
        >
          {isPending ? <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </header>

      <div className="flex flex-col flex-1 min-h-0">
        
        {/* Left Sidebar: Core Info */}
        <aside className="flex flex-col gap-6 shrink-0 overflow-y-auto pb-10">
          <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0 space-y-6">
              {/* Avatar & Basic Identity */}
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

              <Separator />

              {/* Groups / Tags */}
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

        {/* Main Content: Tabs */}
        <main className="flex-1 min-w-0 h-full flex flex-col">
          <Tabs defaultValue="quickStats" className="h-full flex flex-col">
            <div className="overflow-x-auto pb-2 shrink-0">
               <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b rounded-none space-x-2">
                {Object.entries(SECTIONS).map(([key, config]) => (
                  <TabsTrigger 
                    key={key} 
                    value={key}
                    className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-md px-4 py-2"
                  >
                    <config.icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </TabsTrigger>
                ))}
                <TabsTrigger value="custom" className="data-[state=active]:bg-secondary rounded-md px-4 py-2">
                   <Plus className="h-4 w-4 mr-2" /> Custom
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 relative mt-4">
              <ScrollArea className="h-full pr-4 pb-20">
                {/* Generated Sections */}
                {Object.entries(SECTIONS).map(([key, config]) => (
                  <TabsContent key={key} value={key} className="mt-0 space-y-6 animate-in fade-in-50 duration-300">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <config.icon className="h-5 w-5 text-primary" />
                          {config.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {config.fields.map(field => (
                            <FormField 
                              key={field.key}
                              config={field}
                              value={formData.attributes[field.key]}
                              onChange={handleAttributeChange}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}

                {/* Custom Fields Tab */}
                <TabsContent value="custom" className="mt-0 animate-in fade-in-50">
                  <DynamicFieldEditor 
                    attributes={formData.attributes} 
                    onChange={handleAttributeChange} 
                  />
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
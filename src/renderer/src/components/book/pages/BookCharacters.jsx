import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Search, Filter } from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import useImageLoader from '@/hooks/useImageLoader';
import CharacterProfile from './CharacterProfile';

function CharacterCard({ character, size = 'medium', onClick }) {
  const imageData = useImageLoader(character.avatar);

  const sizeClasses = {
    large: 'w-48 h-64',
    medium: 'w-36 h-48',
    small: 'w-32 h-40'
  };

  return (
    <Card
      className={`${sizeClasses[size]} cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={() => onClick(character)}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Avatar className="w-16 h-16 mb-3">
          <AvatarImage src={`data:image/jpeg;${imageData}`} alt={character.firstName} />
          <AvatarFallback>
            {character.firstName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-sm mb-1">{character.firstName} {character.lastName}</h3>
        {character.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {character.description}
          </p>
        )}
        {character.groups && character.groups.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {character.groups.slice(0, 2).map((group, index) => (
              <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                {group}
              </Badge>
            ))}
            {character.groups.length > 2 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{character.groups.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateCharacterDialog({ bookId, onCreate, onClose }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    role: 'supporting',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name.trim()) return;

    try {
      await onCreate({ ...formData, bookId });
      setFormData({ first_name: '', last_name: '', role: 'supporting', description: '' });
    } catch (error) {
      console.error('Failed to create character:', error);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create New Character</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-row gap-2">
          <div className="space-y-2">
            <Label htmlFor="characterFirst_name">First Name *</Label>
            <Input
              id="characterFirst_name"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              placeholder="Enter character first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="characterLast_name">Last Name</Label>
            <Input
              id="characterLast_name"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              placeholder="Enter character last name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="characterRole">Role</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="protagonist">Protagonist</SelectItem>
              <SelectItem value="supporting">Supporting Character</SelectItem>
              <SelectItem value="antagonist">Antagonist</SelectItem>
              <SelectItem value="marginal">Marginal</SelectItem>
              <SelectItem value="unsorted">Unsorted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="characterDescription">Description</Label>
          <Textarea
            id="characterDescription"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief one-liner description..."
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => { setFormData({ first_name: '', last_name: '', role: 'supporting', description: '' }); onClose(); }}>
            Cancel
          </Button>
          <Button type="submit">
            Create Character
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function CharacterSection({ title, characters, cardSize = 'medium', onCharacterClick }) {
  if (!characters.length) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            size={cardSize}
            onClick={onCharacterClick}
          />
        ))}
      </div>
    </div>
  );
}

function BookCharacters({ book }) {
  const { characters, loading, fetchCharacters, createCharacter } = useCharacterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedCharacterId, setSelectedCharacterId] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchCharacters(book.id);
  }, [book.id, fetchCharacters]);

  // Group characters by role
  const groupedCharacters = characters.reduce((acc, character) => {
    const role = character.role || 'unsorted';

    // Filter by search term
    if (searchTerm && !`${character.firstName} ${character.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())) {
      return acc;
    }

    // Filter by role
    if (roleFilter !== 'all' && role !== roleFilter) {
      return acc;
    }

    if (!acc[role]) acc[role] = [];
    acc[role].push(character);

    return acc;
  }, {});


  const handleCreateCharacter = async (characterData) => {
    await createCharacter(characterData);
  };

  const handleCharacterClick = (character) => {
    setSelectedCharacterId(character.id);
  };

  const handleBackToCast = () => {
    setSelectedCharacterId(null);
  };

  // Show character profile if one is selected
  if (selectedCharacterId) {
    return (
      <CharacterProfile
        characterId={selectedCharacterId}
        onBack={handleBackToCast}
      />
    );
  }

  return (
    <div className="space-y-8">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                The Cast
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Character
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search characters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="protagonist">Protagonists</SelectItem>
                    <SelectItem value="supporting">Supporting</SelectItem>
                    <SelectItem value="antagonist">Antagonists</SelectItem>
                    <SelectItem value="marginal">Marginal</SelectItem>
                    <SelectItem value="unsorted">Unsorted</SelectItem>
                  </SelectContent>
                </Select>

              </div>
            </div>
          </CardContent>
        </Card>

        {/* Character Sections */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-20">
              <p>Loading characters...</p>
            </div>
          ) : characters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-20 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">No Characters Yet</h3>
                <p className="mb-4">Start building your cast for "{book.name}"</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Character
              </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <CharacterSection
                title="Protagonists"
                characters={groupedCharacters.protagonist || []}
                cardSize="large"
                onCharacterClick={handleCharacterClick}
              />
              <CharacterSection
                title="Supporting Characters"
                characters={groupedCharacters.supporting || []}
                cardSize="medium"
                onCharacterClick={handleCharacterClick}
              />
              <CharacterSection
                title="Antagonists"
                characters={groupedCharacters.antagonist || []}
                cardSize="medium"
                onCharacterClick={handleCharacterClick}
              />
              <CharacterSection
                title="Marginal Characters"
                characters={groupedCharacters.marginal || []}
                cardSize="small"
                onCharacterClick={handleCharacterClick}
              />
              <CharacterSection
                title="Unsorted"
                characters={groupedCharacters.unsorted || []}
                cardSize="small"
                onCharacterClick={handleCharacterClick}
              />

            </>
          )}
        </div>

        {/* Create Character Dialog Content */}
        <CreateCharacterDialog
          bookId={book.id}
          onCreate={(data) => { handleCreateCharacter(data); setIsCreateDialogOpen(false); }}
          onClose={() => setIsCreateDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
}

export default BookCharacters;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Users, Plus, Search, Filter, ExternalLink, Trash2 } from 'lucide-react';
import { useCharacterStore } from '@/stores/characterStore';
import useImageLoader from '@/hooks/useImageLoader';
import CreateCharacterDialog from './dialogs/CreateCharacterDialog';
import { useTranslation } from 'react-i18next';

function CharacterCard({ character, size = 'medium', onClick, onDelete }) {
  const { t } = useTranslation('common');
  const imageData = useImageLoader(character.avatar);

  const sizeClasses = {
    large: 'w-48 h-64',
    medium: 'w-36 h-48',
    small: 'w-32 h-40'
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onClick(character)}>
          <ExternalLink className="h-4 w-4 mr-2" />
          {t('open')}
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={() => onDelete(character)}>
          <Trash2 className="h-4 w-4 mr-2" />
          {t('delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}


function CharacterSection({ title, characters, cardSize = 'medium', onCharacterClick, onCharacterDelete }) {
  if (!characters.length) return null;

  return (
    <div className="space-y-4 mb-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {characters.map(character => (
          <CharacterCard
            key={character.id}
            character={character}
            size={cardSize}
            onClick={onCharacterClick}
            onDelete={onCharacterDelete}
          />
        ))}
      </div>
    </div>
  );
}

function BookCharacters({ book, onOpenCharacter }) {
  const { t } = useTranslation(['characters', 'common']);
  const { characters, loading, fetchCharacters, createCharacter, deleteCharacter } = useCharacterStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

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
    onOpenCharacter(character);
  };


  const handleDeleteCharacter = (character) => {
    setCharacterToDelete(character);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCharacter = async () => {
    if (characterToDelete) {
      await deleteCharacter(characterToDelete.id);
      setIsDeleteDialogOpen(false);
      setCharacterToDelete(null);
    }
  };


  return (
    <div className="space-y-8 p-4 h-full overflow-y-auto">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        {/* Header */}
        <Card className="mb-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {t('characters:title')}
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                {t('characters:createNew')}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('characters:searchPlaceholder')}
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
                    <SelectValue placeholder={t('characters:filterRole')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('characters:roles.all')}</SelectItem>
                    <SelectItem value="protagonist">{t('characters:roles.protagonist')}</SelectItem>
                    <SelectItem value="supporting">{t('characters:roles.supporting')}</SelectItem>
                    <SelectItem value="antagonist">{t('characters:roles.antagonist')}</SelectItem>
                    <SelectItem value="marginal">{t('characters:roles.marginal')}</SelectItem>
                    <SelectItem value="unsorted">{t('characters:roles.unsorted')}</SelectItem>
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
              <p>{t('loading')}</p>
            </div>
          ) : characters.length === 0 ? (
            <Card>
              <CardContent className="text-center py-20 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium mb-2">{t('characters:empty.title')}</h3>
                <p className="mb-4">{t('characters:empty.description', { bookName: book.name })}</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('characters:createFirst')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <CharacterSection
                title={t('characters:sections.protagonist')}
                characters={groupedCharacters.protagonist || []}
                cardSize="large"
                onCharacterClick={handleCharacterClick}
                onCharacterDelete={handleDeleteCharacter}
              />
              <CharacterSection
                title={t('characters:sections.supporting')}
                characters={groupedCharacters.supporting || []}
                cardSize="medium"
                onCharacterClick={handleCharacterClick}
                onCharacterDelete={handleDeleteCharacter}
              />
              <CharacterSection
                title={t('characters:sections.antagonist')}
                characters={groupedCharacters.antagonist || []}
                cardSize="medium"
                onCharacterClick={handleCharacterClick}
                onCharacterDelete={handleDeleteCharacter}
              />
              <CharacterSection
                title={t('characters:sections.marginal')}
                characters={groupedCharacters.marginal || []}
                cardSize="small"
                onCharacterClick={handleCharacterClick}
                onCharacterDelete={handleDeleteCharacter}
              />
              <CharacterSection
                title={t('characters:sections.unsorted')}
                characters={groupedCharacters.unsorted || []}
                cardSize="small"
                onCharacterClick={handleCharacterClick}
                onCharacterDelete={handleDeleteCharacter}
              />

            </>
          )}
        </div>

        <CreateCharacterDialog
          bookId={book.id}
          isOpen={isCreateDialogOpen}
          onCreate={(data) => { handleCreateCharacter(data); setIsCreateDialogOpen(false); }}
          onClose={() => setIsCreateDialogOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('characters:deleteDialog.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('characters:deleteDialog.description', { name: `${characterToDelete?.firstName} ${characterToDelete?.lastName}` })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteCharacter} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Dialog>
    </div>
  );
}

export default BookCharacters;
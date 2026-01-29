import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Globe, MapPin, Package, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useWorldStore } from '@/stores/worldStore';
import WorldCard from './world/WorldCard';
import LocationCard from './world/LocationCard';
import ObjectCard from './world/ObjectCard';
import CreateWorldDialog from './dialogs/CreateWorldDialog';
import CreateLocationDialog from './dialogs/CreateLocationDialog';
import CreateObjectDialog from './dialogs/CreateObjectDialog';
import WorldDetail from './world/WorldDetail';
import LocationDetail from './world/LocationDetail';
import ObjectDetail from './world/ObjectDetail';
import { useTranslation } from 'react-i18next';

function BookWorld({ book, onOpenWorld, onOpenLocation, onOpenObject, dockviewMode = false }) {
  const { t } = useTranslation(['world', 'common']);
  const {
    worlds,
    locations,
    objects,
    loading,
    fetchWorlds,
    fetchLocations,
    fetchObjects,
    createWorld,
    createLocation,
    createObject,
    deleteWorld,
    deleteLocation,
    deleteObject
  } = useWorldStore();

  const [isCreateWorldDialogOpen, setIsCreateWorldDialogOpen] = useState(false);
  const [isCreateLocationDialogOpen, setIsCreateLocationDialogOpen] = useState(false);
  const [isCreateObjectDialogOpen, setIsCreateObjectDialogOpen] = useState(false);

  // Navigation state
  const [selectedWorldId, setSelectedWorldId] = useState(null);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('worlds');

  // Delete confirmation state
  const [worldToDelete, setWorldToDelete] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);
  const [objectToDelete, setObjectToDelete] = useState(null);
  const [isDeleteWorldDialogOpen, setIsDeleteWorldDialogOpen] = useState(false);
  const [isDeleteLocationDialogOpen, setIsDeleteLocationDialogOpen] = useState(false);
  const [isDeleteObjectDialogOpen, setIsDeleteObjectDialogOpen] = useState(false);

  useEffect(() => {
    fetchWorlds(book.id);
    fetchLocations(book.id);
    fetchObjects(book.id);
  }, [book.id, fetchWorlds, fetchLocations, fetchObjects]);

  const handleCreateWorld = async (worldData) => {
    try {
      await createWorld(worldData);
      setIsCreateWorldDialogOpen(false);
      // Refresh worlds after creation
      fetchWorlds(book.id);
    } catch (error) {
      console.error('Failed to create world:', error);
    }
  };

  const handleCreateLocation = async (locationData) => {
    try {
      await createLocation(locationData);
      setIsCreateLocationDialogOpen(false);
      // Refresh locations after creation
      fetchLocations(book.id);
    } catch (error) {
      console.error('Failed to create location:', error);
    }
  };

  const handleCreateObject = async (objectData) => {
    try {
      await createObject(objectData);
      setIsCreateObjectDialogOpen(false);
      // Refresh objects after creation
      fetchObjects(book.id);
    } catch (error) {
      console.error('Failed to create object:', error);
    }
  };

  // Navigation handlers
  const handleWorldClick = (world) => {
    if (dockviewMode && onOpenWorld) {
      onOpenWorld(world);
    } else {
      setActiveTab('worlds');
      setSelectedWorldId(world.id);
    }
  };

  const handleLocationClick = (location) => {
    if (dockviewMode && onOpenLocation) {
      onOpenLocation(location);
    } else {
      setActiveTab('locations');
      setSelectedLocationId(location.id);
    }
  };

  const handleObjectClick = (object) => {
    if (dockviewMode && onOpenObject) {
      onOpenObject(object);
    } else {
      setActiveTab('objects');
      setSelectedObjectId(object.id);
    }
  };

  const handleBackToWorld = () => {
    setSelectedWorldId(null);
    setSelectedLocationId(null);
    setSelectedObjectId(null);
  };

  // Delete handlers
  const handleDeleteWorld = (world) => {
    setWorldToDelete(world);
    setIsDeleteWorldDialogOpen(true);
  };

  const handleDeleteLocation = (location) => {
    setLocationToDelete(location);
    setIsDeleteLocationDialogOpen(true);
  };

  const handleDeleteObject = (object) => {
    setObjectToDelete(object);
    setIsDeleteObjectDialogOpen(true);
  };

  const confirmDeleteWorld = async () => {
    if (worldToDelete) {
      await deleteWorld(worldToDelete.id);
      setIsDeleteWorldDialogOpen(false);
      setWorldToDelete(null);
    }
  };

  const confirmDeleteLocation = async () => {
    if (locationToDelete) {
      await deleteLocation(locationToDelete.id);
      setIsDeleteLocationDialogOpen(false);
      setLocationToDelete(null);
    }
  };

  const confirmDeleteObject = async () => {
    if (objectToDelete) {
      await deleteObject(objectToDelete.id);
      setIsDeleteObjectDialogOpen(false);
      setObjectToDelete(null);
    }
  };

  if (!dockviewMode) {
    if (selectedWorldId) {
      return <WorldDetail worldId={selectedWorldId} onBack={handleBackToWorld} />;
    }

    if (selectedLocationId) {
      return <LocationDetail locationId={selectedLocationId} onBack={handleBackToWorld} />;
    }

    if (selectedObjectId) {
      return <ObjectDetail objectId={selectedObjectId} onBack={handleBackToWorld} />;
    }
  }

  return (
    <div className="space-y-8 p-2 h-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            {t('world:title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="worlds" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                {t('world:tabs.worlds')}
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('world:tabs.locations')}
              </TabsTrigger>
              <TabsTrigger value="objects" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                {t('world:tabs.objects')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="worlds" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('world:tabs.worlds')}</h3>
                <Button onClick={() => setIsCreateWorldDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('world:actions.createWorld')}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>{t('world:loading.worlds')}</p>
                </div>
              ) : worlds.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">{t('world:empty.worlds.title')}</h3>
                    <p className="mb-4">{t('world:empty.worlds.description', { bookName: book.name })}</p>
                    <Button onClick={() => setIsCreateWorldDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('world:actions.createFirstWorld')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {worlds.map(world => (
                    <WorldCard key={world.id} world={world} onClick={handleWorldClick} onDelete={handleDeleteWorld} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="locations" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('world:tabs.locations')}</h3>
                <Button onClick={() => setIsCreateLocationDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('world:actions.createLocation')}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>{t('world:loading.locations')}</p>
                </div>
              ) : locations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">{t('world:empty.locations.title')}</h3>
                    <p className="mb-4">{t('world:empty.locations.description', { bookName: book.name })}</p>
                    <Button onClick={() => setIsCreateLocationDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('world:actions.createFirstLocation')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {locations.map(location => (
                    <LocationCard key={location.id} location={location} worlds={worlds} onClick={handleLocationClick} onDelete={handleDeleteLocation} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="objects" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{t('world:tabs.objects')}</h3>
                <Button onClick={() => setIsCreateObjectDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('world:actions.createObject')}
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>{t('world:loading.objects')}</p>
                </div>
              ) : objects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">{t('world:empty.objects.title')}</h3>
                    <p className="mb-4">{t('world:empty.objects.description', { bookName: book.name })}</p>
                    <Button onClick={() => setIsCreateObjectDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('world:actions.createFirstObject')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {objects.map(object => (
                    <ObjectCard key={object.id} object={object} onClick={handleObjectClick} onDelete={handleDeleteObject} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create World Dialog */}
      <CreateWorldDialog
        bookId={book.id}
        isOpen={isCreateWorldDialogOpen}
        onCreate={handleCreateWorld}
        onClose={() => setIsCreateWorldDialogOpen(false)}
      />

      {/* Create Location Dialog */}
      <CreateLocationDialog
        bookId={book.id}
        worlds={worlds}
        isOpen={isCreateLocationDialogOpen}
        onCreate={handleCreateLocation}
        onClose={() => setIsCreateLocationDialogOpen(false)}
      />

      {/* Create Object Dialog */}
      <CreateObjectDialog
        bookId={book.id}
        isOpen={isCreateObjectDialogOpen}
        onCreate={handleCreateObject}
        onClose={() => setIsCreateObjectDialogOpen(false)}
      />

      {/* Delete Confirmation Dialogs */}
      <AlertDialog open={isDeleteWorldDialogOpen} onOpenChange={setIsDeleteWorldDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('world:actions.deleteWorld')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('world:dialogs.deleteConfirm.world', { name: worldToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWorld} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteLocationDialogOpen} onOpenChange={setIsDeleteLocationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('world:actions.deleteLocation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('world:dialogs.deleteConfirm.location', { name: locationToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteObjectDialogOpen} onOpenChange={setIsDeleteObjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('world:actions.deleteObject')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('world:dialogs.deleteConfirm.object', { name: objectToDelete?.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteObject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BookWorld;
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

function BookWorld({ book, onOpenWorld, onOpenLocation, onOpenObject, dockviewMode = false }) {
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
            World Building
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="worlds" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Worlds
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations
              </TabsTrigger>
              <TabsTrigger value="objects" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Objects
              </TabsTrigger>
            </TabsList>

            <TabsContent value="worlds" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Worlds</h3>
                <Button onClick={() => setIsCreateWorldDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create World
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>Loading worlds...</p>
                </div>
              ) : worlds.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <Globe className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No Worlds Yet</h3>
                    <p className="mb-4">Start building the worlds for "{book.name}"</p>
                    <Button onClick={() => setIsCreateWorldDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First World
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
                <h3 className="text-lg font-semibold">Locations</h3>
                <Button onClick={() => setIsCreateLocationDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Location
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>Loading locations...</p>
                </div>
              ) : locations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No Locations Yet</h3>
                    <p className="mb-4">Start building locations for "{book.name}"</p>
                    <Button onClick={() => setIsCreateLocationDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Location
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
                <h3 className="text-lg font-semibold">Objects</h3>
                <Button onClick={() => setIsCreateObjectDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Object
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-20">
                  <p>Loading objects...</p>
                </div>
              ) : objects.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-20 text-muted-foreground">
                    <Package className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-medium mb-2">No Objects Yet</h3>
                    <p className="mb-4">Start building objects for "{book.name}"</p>
                    <Button onClick={() => setIsCreateObjectDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Object
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
            <AlertDialogTitle>Delete World</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{worldToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWorld} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteLocationDialogOpen} onOpenChange={setIsDeleteLocationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Location</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{locationToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteObjectDialogOpen} onOpenChange={setIsDeleteObjectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Object</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{objectToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteObject} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BookWorld;
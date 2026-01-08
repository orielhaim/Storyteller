/* global bookAPI */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export const useWorldStore = create(immer((set, get) => ({
  // Current book worlds
  worlds: [],
  locations: [],
  objects: [],
  currentWorld: null,
  currentLocation: null,
  currentObject: null,
  loading: false,
  error: null,

  // Cache for worlds, locations, and objects by book
  worldCache: {}, // Record<bookId, World[]>
  locationCache: {}, // Record<bookId, Location[]>
  objectCache: {}, // Record<bookId, Object[]>

  // --- Actions ---

  // Fetch all worlds for a book (with caching)
  fetchWorlds: async (bookId) => {
    // Check cache first
    const cachedWorlds = get().worldCache[bookId];
    if (cachedWorlds) {
      set(state => { state.worlds = cachedWorlds; });
      return cachedWorlds;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.worlds.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.worlds = res.data;
        state.worldCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch worlds:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch worlds';
      });
      throw e;
    }
  },

  // Fetch all locations for a book (with caching)
  fetchLocations: async (bookId) => {
    // Check cache first
    const cachedLocations = get().locationCache[bookId];
    if (cachedLocations) {
      set(state => { state.locations = cachedLocations; });
      return cachedLocations;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.locations.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.locations = res.data;
        state.locationCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch locations:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch locations';
      });
      throw e;
    }
  },

  // Fetch all objects for a book (with caching)
  fetchObjects: async (bookId) => {
    // Check cache first
    const cachedObjects = get().objectCache[bookId];
    if (cachedObjects) {
      set(state => { state.objects = cachedObjects; });
      return cachedObjects;
    }

    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.objects.getAllByBook(bookId);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.objects = res.data;
        state.objectCache[bookId] = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch objects:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch objects';
      });
      throw e;
    }
  },

  // Fetch a specific world by ID
  fetchWorld: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.worlds.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentWorld = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch world:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch world';
      });
      throw e;
    }
  },

  // Fetch a specific location by ID
  fetchLocation: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.locations.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentLocation = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch location:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch location';
      });
      throw e;
    }
  },

  // Fetch a specific object by ID
  fetchObject: async (id) => {
    set(state => {
      state.loading = true;
      state.error = null;
    });

    try {
      const res = await bookAPI.objects.getById(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        state.currentObject = res.data;
        state.loading = false;
      });

      return res.data;
    } catch (e) {
      console.error('Failed to fetch object:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to fetch object';
      });
      throw e;
    }
  },

  // Create a new world
  createWorld: async (data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.worlds.create(data);
      if (!res.success) throw new Error(res.error);

      const newWorld = res.data;

      set(state => {
        state.worlds.push(newWorld);
        // Invalidate cache for this book
        delete state.worldCache[data.bookId];
        state.loading = false;
      });

      return newWorld;
    } catch (e) {
      console.error('Failed to create world:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create world';
      });
      throw e;
    }
  },

  // Update a world
  updateWorld: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.worlds.update(id, data);
      if (!res.success) throw new Error(res.error);

      const updatedWorld = res.data;

      set(state => {
        // Update in worlds array
        const index = state.worlds.findIndex(world => world.id === id);
        if (index !== -1) {
          state.worlds[index] = updatedWorld;
        }

        // Update current world if it's the one being updated
        if (state.currentWorld?.id === id) {
          state.currentWorld = updatedWorld;
        }

        // Invalidate cache for this world's book
        if (updatedWorld.bookId) {
          delete state.worldCache[updatedWorld.bookId];
        }

        state.loading = false;
      });

      return updatedWorld;
    } catch (e) {
      console.error('Failed to update world:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update world';
      });
      throw e;
    }
  },

  // Delete a world
  deleteWorld: async (id) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.worlds.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        // Remove from worlds array
        state.worlds = state.worlds.filter(world => world.id !== id);

        // Clear current world if it's the one being deleted
        if (state.currentWorld?.id === id) {
          state.currentWorld = null;
        }

        // Invalidate cache for all books (since we don't know which book this world belonged to)
        state.worldCache = {};

        state.loading = false;
      });

      return res;
    } catch (e) {
      console.error('Failed to delete world:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete world';
      });
      throw e;
    }
  },

  // Create a new location
  createLocation: async (data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.locations.create(data);
      if (!res.success) throw new Error(res.error);

      const newLocation = res.data;

      set(state => {
        state.locations.push(newLocation);
        // Invalidate cache for this book
        delete state.locationCache[data.bookId];
        state.loading = false;
      });

      return newLocation;
    } catch (e) {
      console.error('Failed to create location:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create location';
      });
      throw e;
    }
  },

  // Update a location
  updateLocation: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.locations.update(id, data);
      if (!res.success) throw new Error(res.error);

      const updatedLocation = res.data;

      set(state => {
        // Update in locations array
        const index = state.locations.findIndex(location => location.id === id);
        if (index !== -1) {
          state.locations[index] = updatedLocation;
        }

        // Update current location if it's the one being updated
        if (state.currentLocation?.id === id) {
          state.currentLocation = updatedLocation;
        }

        // Invalidate cache for this location's book
        if (updatedLocation.bookId) {
          delete state.locationCache[updatedLocation.bookId];
        }

        state.loading = false;
      });

      return updatedLocation;
    } catch (e) {
      console.error('Failed to update location:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update location';
      });
      throw e;
    }
  },

  // Delete a location
  deleteLocation: async (id) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.locations.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        // Remove from locations array
        state.locations = state.locations.filter(location => location.id !== id);

        // Clear current location if it's the one being deleted
        if (state.currentLocation?.id === id) {
          state.currentLocation = null;
        }

        // Invalidate cache for all books (since we don't know which book this location belonged to)
        state.locationCache = {};

        state.loading = false;
      });

      return res;
    } catch (e) {
      console.error('Failed to delete location:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete location';
      });
      throw e;
    }
  },

  // Create a new object
  createObject: async (data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.objects.create(data);
      if (!res.success) throw new Error(res.error);

      const newObject = res.data;

      set(state => {
        state.objects.push(newObject);
        // Invalidate cache for this book
        delete state.objectCache[data.bookId];
        state.loading = false;
      });

      return newObject;
    } catch (e) {
      console.error('Failed to create object:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to create object';
      });
      throw e;
    }
  },

  // Update an object
  updateObject: async (id, data) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.objects.update(id, data);
      if (!res.success) throw new Error(res.error);

      const updatedObject = res.data;

      set(state => {
        // Update in objects array
        const index = state.objects.findIndex(object => object.id === id);
        if (index !== -1) {
          state.objects[index] = updatedObject;
        }

        // Update current object if it's the one being updated
        if (state.currentObject?.id === id) {
          state.currentObject = updatedObject;
        }

        // Invalidate cache for this object's book
        if (updatedObject.bookId) {
          delete state.objectCache[updatedObject.bookId];
        }

        state.loading = false;
      });

      return updatedObject;
    } catch (e) {
      console.error('Failed to update object:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to update object';
      });
      throw e;
    }
  },

  // Delete an object
  deleteObject: async (id) => {
    set(state => { state.loading = true; state.error = null; });

    try {
      const res = await bookAPI.objects.delete(id);
      if (!res.success) throw new Error(res.error);

      set(state => {
        // Remove from objects array
        state.objects = state.objects.filter(object => object.id !== id);

        // Clear current object if it's the one being deleted
        if (state.currentObject?.id === id) {
          state.currentObject = null;
        }

        // Invalidate cache for all books (since we don't know which book this object belonged to)
        state.objectCache = {};

        state.loading = false;
      });

      return res;
    } catch (e) {
      console.error('Failed to delete object:', e);
      set(state => {
        state.loading = false;
        state.error = e.message || 'Failed to delete object';
      });
      throw e;
    }
  },

  // Clear worlds for a book
  clearWorlds: (bookId) => set(state => {
    state.worlds = [];
    if (bookId) {
      delete state.worldCache[bookId];
    }
    state.error = null;
  }),

  // Clear locations for a book
  clearLocations: (bookId) => set(state => {
    state.locations = [];
    if (bookId) {
      delete state.locationCache[bookId];
    }
    state.error = null;
  }),

  // Clear objects for a book
  clearObjects: (bookId) => set(state => {
    state.objects = [];
    if (bookId) {
      delete state.objectCache[bookId];
    }
    state.error = null;
  }),

  // Invalidate cache for a specific book
  invalidateWorldCache: (bookId) => set(state => {
    delete state.worldCache[bookId];
    delete state.locationCache[bookId];
    delete state.objectCache[bookId];
  }),

  // Set current world (for viewing/editing)
  setCurrentWorld: (world) => set(state => {
    state.currentWorld = world;
  }),

  // Set current location (for viewing/editing)
  setCurrentLocation: (location) => set(state => {
    state.currentLocation = location;
  }),

  // Set current object (for viewing/editing)
  setCurrentObject: (object) => set(state => {
    state.currentObject = object;
  }),

  // Clear current world
  clearCurrentWorld: () => set(state => {
    state.currentWorld = null;
    state.error = null;
  }),

  // Clear current location
  clearCurrentLocation: () => set(state => {
    state.currentLocation = null;
    state.error = null;
  }),

  // Clear current object
  clearCurrentObject: () => set(state => {
    state.currentObject = null;
    state.error = null;
  }),
})));
import { useEffect, useState, useCallback, useMemo, memo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderTree,
  Settings,
  SlidersHorizontal,
  BookOpen,
  Library,
  Sparkles,
  Archive,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BookGrid from '@/components/BookGrid';
import CreateBookDialog from '@/components/dialogs/CreateBookDialog';
import CreateSeriesDialog from '@/components/dialogs/CreateSeriesDialog';
import SeriesDialog from '@/components/dialogs/SeriesDialog';
import { useBooksStore } from '@/stores/booksStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import React from 'react';

type FilterType = 'all' | 'books' | 'series';

interface FilterState {
  type: FilterType;
  showBooksInSeries: boolean;
  showArchived: boolean;
}

interface Book {
  id: string;
  name: string;
  archived?: boolean;
  [key: string]: unknown;
}

interface Series {
  id: string;
  name: string;
  archived?: boolean;
  [key: string]: unknown;
}

interface ProcessedBook extends Book {
  type: 'book';
  seriesName: string | null;
  isInSeries: boolean;
}

interface ProcessedSeries extends Series {
  type: 'series';
}

type ProcessedItem = ProcessedBook | ProcessedSeries;

const FILTER_TABS = [
  { value: 'all', label: 'All', icon: Library },
  { value: 'books', label: 'Books', icon: BookOpen },
  { value: 'series', label: 'Series', icon: FolderTree },
] as const;

const EMPTY_STATES: Record<FilterType, {
  icon: typeof Plus;
  title: string;
  description: string;
}> = {
  books: {
    icon: BookOpen,
    title: 'No books yet',
    description: 'Start your writing journey by creating your first book.',
  },
  series: {
    icon: FolderTree,
    title: 'No series created',
    description: 'Organize your books into series for better structure.',
  },
  all: {
    icon: Sparkles,
    title: 'Your library awaits',
    description: 'Create books and series to build your literary universe.',
  },
};

const FilterOption = memo(function FilterOption({
  id,
  label,
  checked,
  onCheckedChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon: typeof Eye;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <Icon className={cn(
          "size-4 transition-colors",
          checked ? "text-primary" : "text-muted-foreground"
        )} />
        <Label
          htmlFor={id}
          className="text-sm font-medium cursor-pointer select-none"
        >
          {label}
        </Label>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange} className={undefined} />
    </div>
  );
});

// Loading skeleton component
const LoadingSkeleton = memo(function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative">
        <div className="size-12 rounded-full border-2 border-primary/20" />
        <Loader2 className="absolute inset-0 size-12 text-primary animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-foreground">Loading your library</p>
        <p className="text-xs text-muted-foreground">Fetching books and series...</p>
      </div>
    </div>
  );
});

// Empty state component
const EmptyState = memo(function EmptyState({
  filterType,
  onCreateBook,
  onCreateSeries,
}: {
  filterType: FilterType;
  onCreateBook: () => void;
  onCreateSeries: () => void;
}) {
  const config = EMPTY_STATES[filterType];
  const Icon = config.icon;

  return (
    <Empty className="py-24">
      <EmptyMedia variant="icon" className={undefined}>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
          <div className="relative size-16 rounded-full bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
            <Icon className="size-7 text-primary" strokeWidth={1.5} />
          </div>
        </div>
      </EmptyMedia>
      <EmptyTitle className="text-xl font-semibold">
        {config.title}
      </EmptyTitle>
      <EmptyDescription className="max-w-sm">
        {config.description}
      </EmptyDescription>
      <EmptyContent className="flex flex-wrap gap-3 justify-center pt-2">
        {filterType !== 'series' && (
          <Button onClick={onCreateBook} className="gap-2">
            <Plus className="size-4" />
            Create Book
          </Button>
        )}
        {filterType !== 'books' && (
          <Button onClick={onCreateSeries} variant="outline" className="gap-2">
            <FolderTree className="size-4" />
            Create Series
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
});

// Main component
export default function Home() {
  const navigate = useNavigate();

  // Dialog states
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

  // Store
  const {
    books: booksMap,
    series: seriesMap,
    seriesLayout,
    loading,
    fetchBooks,
    fetchSeries,
    fetchSeriesBooks,
  } = useBooksStore();

  const {
    settings,
    isLoaded: settingsLoaded,
    loadSettings,
    updateSetting,
  } = useSettingsStore();

  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    showBooksInSeries: false,
    showArchived: false,
  });

  const filtersInitialized = useRef(false);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settingsLoaded && !filtersInitialized.current && settings?.filters) {
      const savedFilters = {
        type: (settings.filters.type as FilterType) || 'all',
        showBooksInSeries: settings.filters.showBooksInSeries ?? false,
        showArchived: settings.filters.showArchived ?? false,
      };
      filtersInitialized.current = true;
      setFilters(savedFilters);
    }
  }, [settingsLoaded, settings]);

  // Initial data fetch
  useEffect(() => {
    Promise.all([fetchBooks(), fetchSeries()]);
  }, [fetchBooks, fetchSeries]);

  // Fetch series books when series data changes
  useEffect(() => {
    const seriesIds = Object.keys(seriesMap);
    if (seriesIds.length > 0) {
      seriesIds.forEach((id) => fetchSeriesBooks(id));
    }
  }, [seriesMap, fetchSeriesBooks]);

  // Memoized data transformations
  const booksList = useMemo(() => Object.values(booksMap) as Book[], [booksMap]);
  const seriesList = useMemo(() => Object.values(seriesMap) as Series[], [seriesMap]);

  const bookToSeriesMap = useMemo(() => {
    const map = new Map<string, string>();
    Object.entries(seriesLayout).forEach(([seriesId, bookIds]) => {
      const seriesName = seriesMap[seriesId]?.name;
      if (seriesName && Array.isArray(bookIds)) {
        bookIds.forEach((bookId) => map.set(bookId, seriesName));
      }
    });
    return map;
  }, [seriesLayout, seriesMap]);

  const processedItems = useMemo((): ProcessedItem[] => {
    const { type, showBooksInSeries, showArchived } = filters;

    const processedBooks: ProcessedBook[] = booksList
      .filter((book) => showArchived || !book.archived)
      .map((book) => ({
        ...book,
        type: 'book' as const,
        seriesName: bookToSeriesMap.get(book.id) || null,
        isInSeries: bookToSeriesMap.has(book.id),
      }));

    const processedSeries: ProcessedSeries[] = seriesList
      .filter((series) => showArchived || !series.archived)
      .map((series) => ({
        ...series,
        type: 'series' as const,
      }));

    switch (type) {
      case 'books':
        return processedBooks;
      case 'series':
        return processedSeries;
      case 'all':
      default:
        const filteredBooks = showBooksInSeries
          ? processedBooks
          : processedBooks.filter((book) => !book.isInSeries);
        return [...filteredBooks, ...processedSeries];
    }
  }, [filters, booksList, seriesList, bookToSeriesMap]);

  // Filter update handlers
  const updateFilter = useCallback(<K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      if (settingsLoaded) {
        updateSetting(`filters.${key}`, value).catch((error) => {
          console.error(`Failed to save filter setting ${key}:`, error);
        });
      }
      return newFilters;
    });
  }, [settingsLoaded, updateSetting]);

  // Event handlers
  const handleSeriesClick = useCallback((series: Series) => {
    setSelectedSeries(series);
    setSeriesDialogOpen(true);
  }, []);

  const handleSeriesUpdate = useCallback(() => {
    fetchBooks();
    fetchSeries();
  }, [fetchBooks, fetchSeries]);

  const handleNavigateSettings = useCallback(() => {
    navigate('/settings');
  }, [navigate]);

  const openCreateBook = useCallback(() => setCreateBookOpen(true), []);
  const openCreateSeries = useCallback(() => setCreateSeriesOpen(true), []);

  // Active filters count for badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.showBooksInSeries) count++;
    if (filters.showArchived) count++;
    return count;
  }, [filters.showBooksInSeries, filters.showArchived]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        {/* Background decoration */}
        <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  My Library
                </h1>
                <p className="text-muted-foreground">
                  Manage and organize your writing projects
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="size-4" />
                      <span>Create</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className={undefined} inset={undefined}>Create New</DropdownMenuLabel>
                    <DropdownMenuSeparator className={undefined} />
                    <DropdownMenuItem onClick={openCreateBook} className="gap-2 cursor-pointer" inset={undefined}>
                      <BookOpen className="size-4" />
                      <span>New Book</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={openCreateSeries} className="gap-2 cursor-pointer" inset={undefined}>
                      <FolderTree className="size-4" />
                      <span>New Series</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNavigateSettings} className={undefined}                    >
                      <Settings className="size-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className={undefined}>Settings</TooltipContent>
                </Tooltip>
              </div>
            </header>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Filter Tabs */}
              <Tabs
                value={filters.type}
                onValueChange={(value) => updateFilter('type', value as FilterType)} className={undefined}              >
                <TabsList className="h-10 p-1">
                  {FILTER_TABS.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className="gap-2 px-4 data-[state=active]:shadow-sm"
                    >
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              {/* Filter Options */}
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <SlidersHorizontal className="size-4" />
                      <span>Options</span>
                      {activeFiltersCount > 0 && (
                        <Badge
                          variant="secondary"
                          className="size-5 p-0 justify-center text-xs"
                        >
                          {activeFiltersCount}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-64">
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">Display Options</h4>
                      <p className="text-xs text-muted-foreground">
                        Customize what you see in your library
                      </p>
                    </div>
                    <Separator className="my-3" />
                    <div className="space-y-1">
                      {filters.type === 'all' && (
                        <FilterOption
                          id="show-series-books"
                          label="Show books in series"
                          checked={filters.showBooksInSeries}
                          onCheckedChange={(checked) => updateFilter('showBooksInSeries', checked)}
                          icon={filters.showBooksInSeries ? Eye : EyeOff}
                        />
                      )}
                      <FilterOption
                        id="show-archived"
                        label="Show archived items"
                        checked={filters.showArchived}
                        onCheckedChange={(checked) => updateFilter('showArchived', checked)}
                        icon={Archive}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Main Content */}
            <main className="min-h-[50vh]">
              {loading && processedItems.length === 0 ? (
                <LoadingSkeleton />
              ) : processedItems.length > 0 ? (
                <BookGrid
                  items={processedItems}
                  onSeriesClick={handleSeriesClick}
                  enableDragDrop={filters.type !== 'books'}
                  onSeriesUpdate={handleSeriesUpdate}
                />
              ) : (
                <EmptyState
                  filterType={filters.type}
                  onCreateBook={openCreateBook}
                  onCreateSeries={openCreateSeries}
                />
              )}
            </main>
          </div>
        </div>

        {/* Dialogs */}
        <CreateBookDialog
          open={createBookOpen}
          onOpenChange={setCreateBookOpen}
        />
        <CreateSeriesDialog
          open={createSeriesOpen}
          onOpenChange={setCreateSeriesOpen}
        />
        {selectedSeries && (
          <SeriesDialog
            open={seriesDialogOpen}
            onOpenChange={setSeriesDialogOpen}
            series={selectedSeries}
            onSeriesUpdate={handleSeriesUpdate}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
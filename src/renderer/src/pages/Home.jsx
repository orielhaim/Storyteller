import { useEffect, useState } from 'react';
import { Plus, FolderTree, Filter, Settings, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BookGrid from '@/components/BookGrid';
import CreateBookDialog from '@/components/dialogs/CreateBookDialog';
import CreateSeriesDialog from '@/components/dialogs/CreateSeriesDialog';
import SeriesDialog from '@/components/dialogs/SeriesDialog';
import { useBooksStore } from '@/stores/booksStore';
import {
  Empty,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent
} from '@/components/ui/empty';

function Home() {
  const navigate = useNavigate();
  const [createBookOpen, setCreateBookOpen] = useState(false);
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState(null);

  const [filterType, setFilterType] = useState('all');
  const [showBooksInSeries, setShowBooksInSeries] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const {
    books: booksMap,
    series: seriesMap,
    seriesLayout,
    loading,
    fetchBooks,
    fetchSeries,
    fetchSeriesBooks
  } = useBooksStore();

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchBooks(), fetchSeries()]);
    };
    loadData();
  }, [fetchBooks, fetchSeries]);

  useEffect(() => {
    const seriesIds = Object.keys(seriesMap);
    if (seriesIds.length > 0) {
      seriesIds.forEach(id => fetchSeriesBooks(id));
    }
  }, [seriesMap, fetchSeriesBooks]);

  const handleSeriesClick = (seriesItem) => {
    setSelectedSeries(seriesItem);
    setSeriesDialogOpen(true);
  };

  const handleSeriesUpdate = () => {
    // Refresh data when series are updated
    fetchBooks();
    fetchSeries();
  };

  const booksList = Object.values(booksMap);
  const seriesList = Object.values(seriesMap);

  const bookToSeriesMap = new Map();

  Object.entries(seriesLayout).forEach(([sId, bookIds]) => {
    const sName = seriesMap[sId]?.name;
    if (sName && Array.isArray(bookIds)) {
      bookIds.forEach(bId => bookToSeriesMap.set(bId, sName));
    }
  });

  const processedItems = (() => {
    const cleanBooks = booksList
      .filter(b => showArchived || !b.archived)
      .map(b => ({
        ...b,
        type: 'book',
        seriesName: bookToSeriesMap.get(b.id) || null,
        isInSeries: bookToSeriesMap.has(b.id)
      }));

    const cleanSeries = seriesList
      .filter(s => showArchived || !s.archived)
      .map(s => ({ ...s, type: 'series' }));

    switch (filterType) {
      case 'books':
        return cleanBooks;
      case 'series':
        return cleanSeries;
      case 'all':
      default:
        const filteredBooks = showBooksInSeries
          ? cleanBooks
          : cleanBooks.filter(b => !b.isInSeries);

        return [...filteredBooks, ...cleanSeries];
    }
  })();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-6 space-y-8">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Library</h1>
            <p className="text-muted-foreground mt-1">Manage your collection</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateSeriesOpen(true)} variant="outline">
              <FolderTree className="mr-2 h-4 w-4" />
              New Series
            </Button>
            <Button onClick={() => setCreateBookOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Book
            </Button>
            <Button onClick={() => navigate('/settings')} variant="ghost" size="icon" className="cursor-pointer">
              <Settings className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-card p-2 rounded-lg border shadow-sm">
          <div className="flex items-center gap-4 px-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
              {['all', 'books', 'series'].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType(type)}
                  className="capitalize h-7 px-3 text-xs"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {filterType === 'all' && (
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full px-2 py-1.5">
                    <Label htmlFor="show-series-books" className="text-sm cursor-pointer">
                      Show books inside series
                    </Label>
                    <Switch
                      id="show-series-books"
                      checked={showBooksInSeries}
                      onCheckedChange={setShowBooksInSeries}
                    />
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <div className="flex items-center justify-between w-full px-2 py-1.5">
                  <Label htmlFor="show-archived" className="text-sm cursor-pointer">
                    Show archived items
                  </Label>
                  <Switch
                    id="show-archived"
                    checked={showArchived}
                    onCheckedChange={setShowArchived}
                  />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <main>
          {loading && processedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 text-muted-foreground animate-pulse">
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <p>Loading your library...</p>
            </div>
          ) : (
            <BookGrid
              items={processedItems}
              onSeriesClick={handleSeriesClick}
              enableDragDrop={filterType !== 'books'}
              onSeriesUpdate={handleSeriesUpdate}
            />
          )}

          {!loading && processedItems.length === 0 && (
            <Empty className="py-20">
              <EmptyMedia variant="icon">
                {filterType === 'books' ? (
                  <Plus className="h-8 w-8" />
                ) : filterType === 'series' ? (
                  <FolderTree className="h-8 w-8" />
                ) : (
                  <Filter className="h-8 w-8" />
                )}
              </EmptyMedia>
              <EmptyTitle>
                {filterType === 'books' ? 'Your bookshelf is empty' :
                  filterType === 'series' ? 'No series created yet' :
                    'Your library awaits its first entry'}
              </EmptyTitle>
              <EmptyDescription>
                {filterType === 'books' ? 'Start building your collection by adding your first book.' :
                  filterType === 'series' ? 'Create series to organize and group your books thematically.' :
                    'Add books and create series to bring your literary world to life.'}
              </EmptyDescription>
              <EmptyContent className="flex gap-2">
                {filterType !== 'series' && (
                  <Button onClick={() => setCreateBookOpen(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Book
                  </Button>
                )}
                {filterType !== 'books' && (
                  <Button
                    onClick={() => setCreateSeriesOpen(true)}
                    variant="outline"
                    size="sm"
                  >
                    <FolderTree className="h-4 w-4 mr-2" />
                    Create Series
                  </Button>
                )}
              </EmptyContent>
            </Empty>
          )}
        </main>

        <CreateBookDialog open={createBookOpen} onOpenChange={setCreateBookOpen} />
        <CreateSeriesDialog open={createSeriesOpen} onOpenChange={setCreateSeriesOpen} />
        {selectedSeries && (
          <SeriesDialog
            open={seriesDialogOpen}
            onOpenChange={setSeriesDialogOpen}
            series={selectedSeries}
            onSeriesUpdate={handleSeriesUpdate}
          />
        )}
      </div>
    </div>
  );
}

export default Home;
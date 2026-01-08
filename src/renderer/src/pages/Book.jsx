import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBookStore } from '@/stores/bookStore';
import BookNavbar from '@/components/book/shared/BookNavbar';
import BookOverview from '@/components/book/pages/BookOverview';
import BookWrite from '@/components/book/pages/BookWrite';
import BookCharacters from '@/components/book/pages/BookCharacters';
import BookWorld from '@/components/book/pages/BookWorld';
import BookSettings from '@/components/book/pages/BookSettings';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

function Book() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookId = searchParams.get('id');
  const page = searchParams.get('page') || 'overview';

  const { currentBook, loading, error, fetchBook, clearCurrentBook } = useBookStore();

  useEffect(() => {
    if (!bookId) {
      navigate('/');
      return;
    }

    // Only fetch if we don't have this book cached or if it's a different book
    if (!currentBook || currentBook.id !== parseInt(bookId)) {
      fetchBook(parseInt(bookId)).catch(() => {
        // If book doesn't exist, redirect to home
        navigate('/');
      });
    }
  }, [bookId, currentBook, fetchBook, navigate]);

  // Clear current book when component unmounts
  useEffect(() => {
    return () => {
      clearCurrentBook();
    };
  }, [clearCurrentBook]);

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    navigate(`/book?${params.toString()}`, { replace: true });
  };

  if (!bookId) {
    return null; // Will redirect
  }

  if (loading && !currentBook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error || !currentBook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Book not found'}
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Return to library
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderPage = () => {
    switch (page) {
      case 'overview':
        return <BookOverview book={currentBook} />;
      case 'write':
        return <BookWrite book={currentBook} />;
      case 'characters':
        return <BookCharacters book={currentBook} />;
      case 'world':
        return <BookWorld book={currentBook} />;
      case 'settings':
        return <BookSettings book={currentBook} />;
      default:
        return <BookOverview book={currentBook} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <BookNavbar
        book={currentBook}
        currentPage={page}
        onPageChange={handlePageChange}
      />
      <main className="container mx-auto px-6 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default Book;
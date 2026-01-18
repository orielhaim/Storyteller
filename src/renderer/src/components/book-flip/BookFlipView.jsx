import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { tiptapToHTML } from '@/lib/tiptap-to-html';
import { simplePaginateHTML } from '@/lib/paginate-content';
import useImageLoader from '@/hooks/useImageLoader';
import { ChevronLeft, ChevronRight, BookOpen, Book as BookIcon } from 'lucide-react';

function PageCover({ book, isBack = false, ref }) {
  const imageUrl = useImageLoader(book?.image);

  if (isBack) {
    return (
      <div className="page page-cover" ref={ref} data-density="hard">
        <div className="page-content w-full h-full bg-stone-100 border-l-4 border-stone-300 shadow-2xl flex flex-col items-center justify-center p-12 rounded-sm">
          <div className="text-center space-y-6">
            <div className="w-16 h-0.5 bg-stone-400 mx-auto mb-8" />
            <h2 className="text-3xl font-serif font-semibold text-stone-800 leading-normal">
              {book?.name || 'Untitled Book'}
            </h2>
            <p className="text-sm text-stone-500 mt-12 tracking-widest uppercase flex items-center justify-center gap-2">
              <BookIcon className="w-4 h-4" />
              The End
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page page-cover" ref={ref} data-density="hard">
      <div className="page-content w-full h-full bg-stone-200 shadow-2xl flex flex-col items-center justify-center rounded-sm relative overflow-hidden border border-stone-300">
        {imageUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <img src={imageUrl} alt={book?.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-12 left-0 right-0 p-8 text-center bg-black/40 backdrop-blur-md border-y border-white/10">
              <h1 className="text-4xl font-serif font-bold text-white mb-2 leading-tight">
                {book?.name || 'Untitled Book'}
              </h1>
              {book?.author && (
                <p className="text-xl text-white/90 font-medium italic">
                  by {book.author}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center space-y-8 p-12">
            <div className="w-20 h-1 bg-indigo-600 mx-auto mb-10" />
            <div>
              <h1 className="text-5xl font-serif font-bold text-slate-900 leading-tight pb-4">
                {book?.name || 'Untitled Book'}
              </h1>
              {book?.author && (
                <p className="text-2xl text-slate-600 font-light italic mt-6">
                  by {book.author}
                </p>
              )}
            </div>
            {book?.description && (
              <p className="text-lg text-slate-700 max-w-lg mx-auto leading-relaxed font-light">
                {book.description}
              </p>
            )}
            <div className="w-20 h-1 bg-indigo-600 mx-auto mt-10" />
          </div>
        )}
      </div>
    </div>
  );
}

PageCover.displayName = 'PageCover';

function Page({ content, pageNumber, totalPages, ref, isBlank = false }) {
  return (
    <div className="page" ref={ref}>
      <div className="page-content w-full h-full bg-linear-to-br from-white to-stone-50 border border-stone-300 shadow-xl relative rounded-sm">
        {!isBlank && (
          <>
            <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-stone-300 to-transparent" />
            <div
              className="h-full overflow-hidden p-8 font-serif book-page-content leading-relaxed"
              dangerouslySetInnerHTML={{ __html: content }}
              dir="auto"
            />
            <div className="absolute bottom-6 left-0 right-0 text-center">
              <span className="text-sm text-stone-500 font-sans tracking-wider">
                {pageNumber}
                <span className="mx-3 text-stone-300">|</span>
                {totalPages}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

Page.displayName = 'Page';

export function BookFlipView({ book, combinedContent }) {
  const flipBookRef = useRef(null);
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const htmlContent = useMemo(() => {
    if (!combinedContent) return '';
    return tiptapToHTML(combinedContent);
  }, [combinedContent]);

  useEffect(() => {
    if (!htmlContent) {
      setPages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsReady(false);

    const timer = setTimeout(() => {
      try {
        const paginatedPages = simplePaginateHTML(htmlContent, {
          pageWidth: 650,
          pageHeight: 867,
          marginTop: 80,
          marginBottom: 80,
          marginLeft: 80,
          marginRight: 80,
        });

        setPages(paginatedPages);
      } catch (error) {
        console.error('Pagination error:', error);
        setPages([htmlContent]);
      } finally {
        setIsLoading(false);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [htmlContent]);

  useEffect(() => {
    if (!flipBookRef.current || pages.length === 0 || isLoading) return;

    const timer = setTimeout(() => {
      try {
        const pageFlip = flipBookRef.current?.pageFlip();
        if (pageFlip) {
          setTotalPage(pageFlip.getPageCount());
          setIsReady(true);
        }
      } catch (error) {
        console.error('PageFlip initialization error:', error);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [pages, isLoading]);

  const handlePageFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  const handleFlipNext = useCallback(() => {
    if (!flipBookRef.current) return;
    try {
      const pageFlip = flipBookRef.current.pageFlip();
      pageFlip?.flipNext();
    } catch (error) {
      console.error('Flip next error:', error);
    }
  }, []);

  const handleFlipPrev = useCallback(() => {
    if (!flipBookRef.current) return;
    try {
      const pageFlip = flipBookRef.current.pageFlip();
      pageFlip?.flipPrev();
    } catch (error) {
      console.error('Flip prev error:', error);
    }
  }, []);

  const handleInit = useCallback(() => {
    if (!flipBookRef.current) return;
    try {
      const pageFlip = flipBookRef.current.pageFlip();
      if (pageFlip) {
        setTotalPage(pageFlip.getPageCount());
        setIsReady(true);
      }
    } catch (error) {
      console.error('Init error:', error);
    }
  }, []);

  const totalContentPages = pages.length;

  const displayPages = useMemo(() => {
    if (pages.length === 0) return [];
    if (pages.length % 2 !== 0) {
      return [...pages, ''];
    }
    return pages;
  }, [pages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-linear-to-br from-slate-100 to-slate-200">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-slate-300" />
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-slate-600 text-lg font-medium">Preparing your book...</p>
        </div>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[600px] bg-linear-to-br from-slate-100 to-slate-200">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
            <BookOpen className="w-10 h-10" />
          </div>
          <p className="text-slate-500 text-lg">No content available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-linear-to-br from-slate-200 via-slate-100 to-stone-200 p-4 relative overflow-auto">
      <div className="relative z-10 shadow-[0_25px_100px_-12px_rgba(0,0,0,0.4)] rounded-lg">
        <HTMLFlipBook
          ref={flipBookRef}
          width={650}
          height={867}
          size="stretch"
          minWidth={550}
          maxWidth={1200}
          minHeight={733}
          maxHeight={1600}
          maxShadowOpacity={0.6}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={handlePageFlip}
          onInit={handleInit}
          className="book-flip-container"
          usePortrait={false}
          drawShadow={true}
          flippingTime={800}
          startZIndex={0}
          autoSize={true}
        >
          <PageCover book={book} isBack={false} />
          {displayPages.map((pageContent, index) => (
            <Page
              key={`page-${index}`}
              content={pageContent}
              pageNumber={index + 1}
              totalPages={totalContentPages}
              isBlank={index >= totalContentPages}
            />
          ))}
          <PageCover book={book} isBack={true} />
        </HTMLFlipBook>
      </div>

      <div className="mt-10 flex items-center gap-6 z-10 relative">
        <button
          type="button"
          onClick={handleFlipPrev}
          disabled={!isReady || currentPage === 0}
          className="group px-8 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 text-base font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
        >
          <span className="flex items-center gap-3">
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
            Previous
          </span>
        </button>

        <div className="px-8 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg min-w-[160px] text-center">
          <span className="text-base font-medium text-slate-600">
            {currentPage === 0 ? (
              <span className="text-indigo-600 font-bold">Cover</span>
            ) : currentPage > totalContentPages ? (
              <span className="text-indigo-600 font-bold">The End</span>
            ) : (
              <>
                Page <span className="text-indigo-600 font-bold">{currentPage}</span>
                <span className="mx-2 text-slate-300">/</span>
                <span className="text-slate-800 font-bold">{totalContentPages}</span>
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={handleFlipNext}
          disabled={!isReady || currentPage >= totalPage - 1}
          className="group px-8 py-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300 text-base font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-lg"
        >
          <span className="flex items-center gap-3">
            Next
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>
    </div>
  );
}
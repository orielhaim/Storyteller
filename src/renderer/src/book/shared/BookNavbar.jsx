import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BookOpen, PenTool, Settings, ArrowLeft, Clock, Eye } from 'lucide-react';
import useImageLoader from '@/hooks/useImageLoader';

const navItems = [
  { id: 'overview', label: 'Overview', icon: BookOpen },
  { id: 'write', label: 'Workspace', icon: PenTool, isPrimary: true },
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'preview', label: 'Preview & Export', icon: Eye },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function BookNavbar({ book, currentPage, onPageChange }) {
  const navigate = useNavigate();

  const handleBackToLibrary = () => {
    navigate('/');
  };

  const imageUrl = useImageLoader(book.image);

  return (
    <Card className="rounded-none border-x-0 border-t-0 py-0!">
      <div className="container max-w-full">
        <div className="flex items-center justify-between py-4 px-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLibrary}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Library
            </Button>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-3">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={book.name}
                  className="h-8 w-8 rounded object-cover"
                />
              )}
              <h1 className="font-semibold text-lg leading-tight">{book.name}</h1>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <Button
                  key={item.id}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 h-9 cursor-pointer ${item.isPrimary && !isActive
                    ? 'hover:bg-yellow-600 hover:text-white'
                    : item.isPrimary && isActive
                      ? 'bg-yellow-500 text-primary-foreground hover:bg-yellow-500 hover:text-white'
                      : ''
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </Card>
  );
}

export default BookNavbar;
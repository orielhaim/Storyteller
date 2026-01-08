import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, User, Globe, Users } from 'lucide-react';
import useImageLoader from '@/hooks/useImageLoader';

function BookOverview({ book }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const imageUrl = useImageLoader(book.image);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="relative">
          {imageUrl && (
            <div className="absolute inset-0 bg-linear-to-r from-background/80 to-background/40 z-10" />
          )}
          <div className="relative z-20 p-8">
            <div className="flex flex-row lg:flex-row gap-8 items-start">
              {/* Book Cover */}
              <div className="shrink-0">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={book.name}
                    className="w-48 h-72 object-cover rounded-lg shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-72 bg-muted rounded-lg flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold tracking-tight mb-2">{book.name}</h1>
                  <p className="text-xl text-muted-foreground flex items-center gap-2">
                    <User className="h-5 w-5" />
                    by {book.author}
                  </p>
                </div>

                {book.description && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Created {formatDate(book.createdAt)}
                  </div>

                  {book.updatedAt !== book.createdAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Updated {formatDate(book.updatedAt)}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    {book.progressStatus === 'not_started' ? 'Not Started' :
                     book.progressStatus === 'in_progress' ? 'In Progress' :
                     book.progressStatus === 'completed' ? 'Completed' : 'Unknown'}
                  </div>
                </div>

                {/* Genres */}
                {book.genres && book.genres.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {book.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {book.targetAudience && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Target Audience:</span> {book.targetAudience}
                      </span>
                    </div>
                  )}

                  {book.primaryLanguage && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="font-medium">Language:</span> {book.primaryLanguage.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <BookOpen className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Continue Writing</h3>
                <p className="text-sm text-muted-foreground">
                  Jump back into your story
                </p>
              </div>
            </Card>

            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Users className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Character Development</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your characters
                </p>
              </div>
            </Card>

            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="text-center space-y-2">
                <Globe className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">World Building</h3>
                <p className="text-sm text-muted-foreground">
                  Explore your world
                </p>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default BookOverview;
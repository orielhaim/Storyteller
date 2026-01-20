import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Eye, ArrowLeft } from 'lucide-react';
import { PreviewEditor } from '@/components/tiptap-templates/preview-editor';
import { BookFlipView } from '@/components/book-flip/BookFlipView';
import { Combobox } from '@/components/ui/combobox';

const MODE_NORMAL = 'normal';
const MODE_PAGE_VIEW = 'pageView';
const MODE_DEMO_VIEW = 'demoView';

function combineContent(chaptersWithScenes) {
  const combinedContent = {
    type: 'doc',
    content: []
  };

  chaptersWithScenes.forEach((chapter, chapterIndex) => {
    if (chapter.name) {
      combinedContent.content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: chapter.name }]
      });
    }

    if (chapter.description) {
      combinedContent.content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: chapter.description }]
      });
    }

    chapter.scenes.forEach((scene, sceneIndex) => {
      if (scene.name) {
        combinedContent.content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: scene.name }]
        });
      }

      if (scene.content) {
        try {
          let sceneContent = scene.content;
          
          if (typeof sceneContent === 'string') {
            if (sceneContent === 'null' || sceneContent.trim() === '') {
              return;
            }
            sceneContent = JSON.parse(sceneContent);
          }
          
          if (!sceneContent) {
            return;
          }
          
          if (sceneContent.type === 'doc' && Array.isArray(sceneContent.content)) {
            combinedContent.content.push(...sceneContent.content);
          } else if (Array.isArray(sceneContent)) {
            combinedContent.content.push(...sceneContent);
          } else if (sceneContent.type && sceneContent.content) {
            combinedContent.content.push(sceneContent);
          }
        } catch (e) {
          console.error('Error parsing scene content:', e, scene);
        }
      }

      if (sceneIndex < chapter.scenes.length - 1) {
        combinedContent.content.push({
          type: 'paragraph',
          content: []
        });
      }
    });

    if (chapterIndex < chaptersWithScenes.length - 1) {
      combinedContent.content.push({
        type: 'paragraph',
        content: []
      });
    }
  });

  if (combinedContent.content.length === 0) {
    combinedContent.content.push({
      type: 'paragraph',
      content: []
    });
  }

  return combinedContent;
}

function BookPreview({ book }) {
  const [mode, setMode] = useState(MODE_NORMAL);
  const [chaptersWithScenes, setChaptersWithScenes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChapterId, setSelectedChapterId] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      if (!book?.id) return;

      setLoading(true);
      setError(null);

      try {
        const res = await window.bookAPI.writing.getAllForPreview(book.id);
        if (!res.success) {
          throw new Error(res.error || 'Failed to load preview data');
        }
        setChaptersWithScenes(res.data || []);
      } catch (e) {
        console.error('Failed to fetch preview data:', e);
        setError(e.message || 'Failed to load preview data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [book?.id]);

  useEffect(() => {
    setSelectedChapterId('all');
  }, [book?.id]);

  const hasContent = useMemo(() => {
    if (!chaptersWithScenes || chaptersWithScenes.length === 0) {
      return false;
    }
    return chaptersWithScenes.some(chapter => 
      chapter.scenes && chapter.scenes.length > 0 && 
      chapter.scenes.some(scene => scene.content)
    );
  }, [chaptersWithScenes]);

  const chapterOptions = useMemo(() => {
    if (!chaptersWithScenes || chaptersWithScenes.length === 0) {
      return [
        { value: 'all', label: 'All chapters' }
      ];
    }

    const options = chaptersWithScenes.map((chapter, index) => ({
      value: String(chapter.id ?? index),
      label: chapter.name || `Chapter ${index + 1}`
    }));

    return [
      { value: 'all', label: 'All chapters' },
      ...options
    ];
  }, [chaptersWithScenes]);

  const filteredChapters = useMemo(() => {
    if (!chaptersWithScenes || chaptersWithScenes.length === 0) {
      return [];
    }

    if (!selectedChapterId || selectedChapterId === 'all') {
      return chaptersWithScenes;
    }

    const chapter = chaptersWithScenes.find((item, index) => {
      const id = String(item.id ?? index);
      return id === selectedChapterId;
    });

    return chapter ? [chapter] : chaptersWithScenes;
  }, [chaptersWithScenes, selectedChapterId]);

  const combinedContent = useMemo(() => {
    if (!filteredChapters || filteredChapters.length === 0 || !hasContent) {
      return null;
    }
    return combineContent(filteredChapters);
  }, [filteredChapters, hasContent]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === MODE_NORMAL) {
    if (!hasContent) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px] p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center space-y-4">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No content yet</h3>
                <p className="text-muted-foreground">
                  There are no chapters or scenes with content to preview. Start writing to see your book preview.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Preview Options</h2>
          <p className="text-muted-foreground">
            Choose how you want to preview your book content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode(MODE_PAGE_VIEW)}>
            <CardContent className="my-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Page View <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">BETA</Badge></h3>
                    <p className="text-sm text-muted-foreground">Read-only paginated view</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  View all your chapters and scenes in a paginated, book-like format. Perfect for reading through your entire manuscript.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setMode(MODE_DEMO_VIEW)}>
            <CardContent className="my-auto">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Demo View <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">ALPHA</Badge></h3>
                    <p className="text-sm text-muted-foreground">Interactive flip-book view</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Experience your book in a beautiful flip-book format. Click through pages just like reading a real book.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === MODE_PAGE_VIEW) {
    return (
      <div className="flex flex-col h-[calc(100vh-4.5rem)]">
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(MODE_NORMAL)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Preview Options
            </Button>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
              BETA
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Chapter</span>
            <Combobox
              className="w-56"
              options={chapterOptions}
              value={selectedChapterId}
              onValueChange={(value) => setSelectedChapterId(value || 'all')}
              placeholder="All chapters"
              searchPlaceholder="Search chapters..."
              emptyMessage="No chapters found."
            />
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <PreviewEditor content={combinedContent} />
        </div>
      </div>
    );
  }

  if (mode === MODE_DEMO_VIEW) {
    return (
      <div className="flex flex-col h-[calc(100vh-4.5rem)]">
        <div className="flex items-center justify-between p-4 border-b bg-background z-20">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMode(MODE_NORMAL)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Preview Options
            </Button>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
              ALPHA
            </Badge>
          </div>
        </div>
        <div className="flex-1 overflow-hidden relative">
          {combinedContent ? (
            <BookFlipView book={book} combinedContent={combinedContent} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="w-full max-w-md">
                <CardContent className="pt-6 text-center space-y-4">
                  <Eye className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">No content available</h3>
                    <p className="text-muted-foreground">
                      There is no content to display in the demo view.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

export default BookPreview;

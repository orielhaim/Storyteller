import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { PreviewEditor } from '@/components/tiptap-templates/preview-editor';
import { Combobox } from '@/components/ui/combobox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EXPORT_FORMATS, exportToPdf, exportToDocx, exportToEpub, exportToMd, exportToTxt } from '@/utils/export';
import { toast } from 'sonner';

export function PagePreviewView({ 
  book, 
  combinedContent, 
  chapterOptions, 
  selectedChapterId, 
  onChapterChange, 
  onBack,
  hasContent,
  exporting,
  setExporting 
}) {
  const editorRef = useRef(null);

  const handleExport = async (formatId) => {
    if (exporting) return;

    const format = Object.values(EXPORT_FORMATS).find(
      f => f.id.toLowerCase() === formatId.toLowerCase()
    );
    
    if (!format) {
      toast.error(`Unknown export format: ${formatId}`);
      return;
    }

    if (!format.enabled) {
      if (format.comingSoon) {
        toast.info(`${format.name} export is coming soon!`);
      }
      return;
    }

    setExporting(true);
    try {
      const editor = editorRef.current?.getEditor();
      if (!editor) {
        throw new Error('Editor instance not available');
      }

      const bookTitle = book?.name || 'book';
      const bookLanguage = book?.primaryLanguage || 'en';
      let result;

      switch (formatId) {
        case 'pdf':
          result = await exportToPdf({
            editor,
            bookTitle,
            bookLanguage,
            selectedChapterId,
          });
          break;
        case 'docx':
          result = await exportToDocx({
            editor,
            bookTitle,
            bookLanguage,
            selectedChapterId,
          });
          break;
        case 'epub':
          result = await exportToEpub();
          break;
        case 'md':
          result = await exportToMd();
          break;
        case 'txt':
          result = await exportToTxt();
          break;
        default:
          throw new Error(`Unsupported export format: ${formatId}`);
      }

      if (result?.success) {
        toast.success(`Successfully exported to ${format.name}!`);
      } else if (result?.message) {
        toast.info(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(`Failed to export: ${error.message || 'Unknown error'}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
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
            onValueChange={(value) => onChapterChange(value || 'all')}
            placeholder="All chapters"
            searchPlaceholder="Search chapters..."
            emptyMessage="No chapters found."
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={exporting || !hasContent}
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {Object.values(EXPORT_FORMATS).map((format) => {
                const Icon = format.icon;
                return (
                  <DropdownMenuItem
                    key={format.id}
                    onClick={() => handleExport(format.id)}
                    disabled={!format.enabled || exporting}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span>{format.name}</span>
                    </div>
                    {format.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Soon
                      </Badge>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <PreviewEditor ref={editorRef} content={combinedContent} />
      </div>
    </div>
  );
}

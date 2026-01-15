import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Download } from 'lucide-react';
import DOMPurify from 'dompurify';

const UpdateModal = ({ isOpen, onClose, updateInfo, currentVersion, onInstallNow }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    if (updateInfo?.releaseDate) {
      const releaseDate = new Date(updateInfo.releaseDate);
      const now = new Date();
      const diffInMs = now - releaseDate;
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays > 0) {
        setTimeAgo(`${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`);
      } else if (diffInHours > 0) {
        setTimeAgo(`${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`);
      } else {
        setTimeAgo('Just now');
      }
    }
  }, [updateInfo]);

  if (!updateInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div>
              <DialogTitle className="text-xl">
                🎉 New Update Available
              </DialogTitle>
              <DialogDescription className="text-base">
                Upgrade from <Badge variant="secondary" className="text-xs">v{currentVersion}</Badge> to <Badge variant="secondary" className="text-xs">v{updateInfo.version}</Badge>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        {console.log(updateInfo)}

        <div className="space-y-4">
          {updateInfo.releaseNotes && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">What's New:</h4>
              <div
                className="text-sm text-muted-foreground prose prose-sm max-w-none dark:prose-invert overflow-y-auto max-h-100"
                dir="auto"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(updateInfo.releaseNotes) }}
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Released {timeAgo}</span>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Remind me later
          </Button>
          <Button onClick={onInstallNow} className="gap-2">
            <Download className="w-4 h-4" />
            Install now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateModal;
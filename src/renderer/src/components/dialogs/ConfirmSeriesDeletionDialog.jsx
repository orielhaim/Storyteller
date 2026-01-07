import { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, Archive, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

function ConfirmSeriesDeletionDialog({ 
  open, 
  onOpenChange, 
  series, 
  bookCount = 0, 
  onDeleteSeriesOnly, 
  onDeleteWithBooks 
}) {
  const [step, setStep] = useState('choice'); // 'choice' | 'confirm_all'

  useEffect(() => {
    if (open) {
      setStep('choice');
    }
  }, [open]);

  const handleClose = () => onOpenChange(false);

  const handleSeriesOnly = () => {
    onDeleteSeriesOnly();
    handleClose();
  };

  const handleConfirmAll = () => {
    onDeleteWithBooks();
    handleClose();
  };

  if (bookCount === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Series
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete the series <strong>"{series?.name}"</strong>?
              <br />
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSeriesOnly}>
              Delete Series
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        
        {step === 'choice' && (
          <>
            <DialogHeader>
              <DialogTitle>Delete Series</DialogTitle>
              <DialogDescription>
                This series contains <strong>{bookCount} books</strong>. How do you want to proceed?
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div 
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group"
                onClick={handleSeriesOnly}
              >
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Archive className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-sm">Keep Books, Delete Series</h4>
                  <p className="text-xs text-muted-foreground">
                    The series will be removed, but the books will remain in your library.
                  </p>
                </div>
                <Button variant="outline" size="sm" className="mt-1">Select</Button>
              </div>

              <div 
                className="flex items-start gap-4 p-4 border border-destructive/20 bg-destructive/5 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer group"
                onClick={() => setStep('confirm_all')}
              >
                <div className="p-2 bg-destructive/10 rounded-full text-destructive">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-sm text-destructive">Delete Everything</h4>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete the series AND all {bookCount} books inside it.
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/20">
                  Select
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>Cancel</Button>
            </DialogFooter>
          </>
        )}

        {step === 'confirm_all' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                Final Confirmation
              </DialogTitle>
              <DialogDescription>
                You are about to delete <strong>"{series?.name}"</strong> and <strong>{bookCount} books</strong>.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive font-medium flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                  This action creates permanent data loss and cannot be reversed.
                </p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setStep('choice')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button variant="destructive" onClick={handleConfirmAll}>
                Yes, Delete Everything
              </Button>
            </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}

export default ConfirmSeriesDeletionDialog;
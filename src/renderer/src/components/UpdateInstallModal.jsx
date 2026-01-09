import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, RotateCcw } from 'lucide-react';

const UpdateInstallModal = ({ isOpen, onClose, updateInfo, onInstallNow }) => {
  if (!updateInfo) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg">
                Update Ready to Install
              </DialogTitle>
              <DialogDescription>
                Version {updateInfo.version} has been downloaded successfully
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          The application will restart to apply the update. Any unsaved work will be lost.
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Later
          </Button>
          <Button onClick={onInstallNow} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Install now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateInstallModal;
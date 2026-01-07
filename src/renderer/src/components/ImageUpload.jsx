import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

function ImageUpload({ 
  value, 
  onChange, 
  className = "", 
  placeholderText = "Upload cover image",
  maxSizeMB = 10 
}) {
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    let isMounted = true;
    
    const loadImage = async () => {
      if (!preview) setIsLoading(true);
      
      try {
        const result = await window.bookAPI.image.getData(value);
        if (isMounted) {
          if (result.success && result.data) {
            setPreview(result.data);
          } else {
            console.error('Failed to load image data');
          }
        }
      } catch (error) {
        console.error('Error fetching image:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadImage();

    return () => { isMounted = false; };
  }, [value]);

  const handleUpload = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please upload an image.');
      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setIsUploadingState(true);

    try {
      const base64Data = await fileToBase64(file);
      const result = await window.bookAPI.image.save(base64Data, file.name);

      if (result.success) {
        onChange(result.data.uuid);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingState(false);
    }
  };

  const setIsUploadingState = (state) => {
    setIsLoading(state);
    setIsDragOver(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (!value) return;

    const previousValue = value;
    onChange(null);
    setPreview(null);

    try {
      await window.bookAPI.image.delete(previousValue);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete image');
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={(e) => handleUpload(e.target.files?.[0])}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full h-full min-h-[200px] rounded-lg overflow-hidden border bg-muted/20">
          <img
            src={preview}
            alt="Cover"
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
             <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8"
            >
              <Upload className="h-4 w-4 mr-2" />
              Change
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleRemove}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => !isLoading && fileInputRef.current?.click()}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`
            relative w-full h-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center
            border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-primary bg-primary/5 scale-[0.99]' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
            }
            ${isLoading ? 'opacity-70 pointer-events-none' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="h-10 w-10 text-muted-foreground mb-3 animate-spin" />
              <p className="text-sm font-medium text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <>
              <div className={`p-4 rounded-full bg-muted mb-3 transition-colors ${isDragOver ? 'bg-primary/10' : ''}`}>
                <ImageIcon className={`h-8 w-8 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {isDragOver ? "Drop image here" : placeholderText}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG or WebP up to {maxSizeMB}MB
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
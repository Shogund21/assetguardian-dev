import { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PhotoData } from '@/types/chillerWizard';

interface PhotoCaptureProps {
  photos: PhotoData[];
  onChange: (photos: PhotoData[]) => void;
  maxPhotos?: number;
  className?: string;
}

export function PhotoCapture({
  photos,
  onChange,
  maxPhotos = 5,
  className,
}: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [captureMode, setCaptureMode] = useState<'camera' | 'gallery' | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: PhotoData[] = [];
    
    for (let i = 0; i < files.length && photos.length + newPhotos.length < maxPhotos; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      // Create blob URL for preview
      const url = URL.createObjectURL(file);
      
      newPhotos.push({
        id: crypto.randomUUID(),
        blob: file,
        url,
        caption: null,
        is_primary: photos.length === 0 && newPhotos.length === 0, // First photo is primary
        synced: false,
      });
    }

    onChange([...photos, ...newPhotos]);
    setCaptureMode(null);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(p => p.id !== photoId);
    
    // If we removed the primary, make the first one primary
    if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.is_primary)) {
      updatedPhotos[0].is_primary = true;
    }
    
    // Revoke object URL to prevent memory leaks
    const photo = photos.find(p => p.id === photoId);
    if (photo?.url && photo.url.startsWith('blob:')) {
      URL.revokeObjectURL(photo.url);
    }
    
    onChange(updatedPhotos);
  };

  const handleSetPrimary = (photoId: string) => {
    const updatedPhotos = photos.map(p => ({
      ...p,
      is_primary: p.id === photoId,
    }));
    onChange(updatedPhotos);
  };

  const handleCaptionChange = (photoId: string, caption: string) => {
    const updatedPhotos = photos.map(p =>
      p.id === photoId ? { ...p, caption: caption || null } : p
    );
    onChange(updatedPhotos);
  };

  const openCamera = () => {
    setCaptureMode('camera');
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.capture = 'environment';
      fileInputRef.current.click();
    }
  };

  const openGallery = () => {
    setCaptureMode('gallery');
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square rounded-lg overflow-hidden border bg-muted"
            >
              {photo.url && (
                <img
                  src={photo.url}
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Primary badge */}
              {photo.is_primary && (
                <div className="absolute top-1 left-1 bg-amber-500 text-white rounded-full p-1">
                  <Star className="h-3 w-3 fill-current" />
                </div>
              )}
              
              {/* Actions */}
              <div className="absolute top-1 right-1 flex gap-1">
                {!photo.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(photo.id)}
                    className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm"
                    title="Set as primary"
                  >
                    <Star className="h-3 w-3 text-muted-foreground" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm"
                  title="Remove photo"
                >
                  <X className="h-3 w-3 text-destructive" />
                </button>
              </div>
              
              {/* Caption input */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                <Input
                  type="text"
                  placeholder="Caption..."
                  value={photo.caption || ''}
                  onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
                  className="h-6 text-xs bg-transparent border-none text-white placeholder:text-white/70 focus-visible:ring-0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add photo buttons */}
      {photos.length < maxPhotos && (
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={openCamera}
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={openGallery}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Gallery
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Photo count */}
      <p className="text-xs text-muted-foreground text-center">
        {photos.length} of {maxPhotos} photos
      </p>
    </div>
  );
}

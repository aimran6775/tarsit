'use client';

import { uploadApi, UploadedImage, UploadFolder, validateImageFile } from '@/lib/api/upload.api';
import { Image as ImageIcon, Loader2, Trash2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface ImageUploadProps {
  onUpload: (image: UploadedImage) => void;
  onRemove?: (publicId: string) => void;
  folder?: UploadFolder;
  maxFiles?: number;
  existingImages?: Array<{ publicId: string; url: string }>;
  className?: string;
  variant?: 'default' | 'avatar' | 'cover';
  label?: string;
  hint?: string;
}

export function ImageUpload({
  onUpload,
  onRemove,
  folder = 'businesses',
  maxFiles = 10,
  existingImages = [],
  className = '',
  variant = 'default',
  label = 'Upload Images',
  hint = 'PNG, JPG, GIF, WebP up to 5MB',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [_uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Silence unused var warning
    if (Object.keys(_uploadProgress).length > 0) {
      console.debug('Upload progress:', _uploadProgress);
    }
  }, [_uploadProgress]);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxFiles - existingImages.length;

      if (fileArray.length > remainingSlots) {
        toast.error(
          `Can only upload ${remainingSlots} more image${remainingSlots !== 1 ? 's' : ''}`
        );
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          toast.error(validation.error);
        } else {
          validFiles.push(file);
        }
      }

      if (validFiles.length === 0) return;

      setIsUploading(true);

      // Upload files one by one (could be parallelized if needed)
      for (const file of validFiles) {
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

        try {
          const result = await uploadApi.uploadImage(file, folder);
          onUpload(result);
          setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));
          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          setUploadProgress((prev) => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }
      }

      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [folder, maxFiles, existingImages.length, onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleRemove = async (publicId: string) => {
    try {
      await uploadApi.deleteImage(publicId);
      onRemove?.(publicId);
      toast.success('Image removed');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove image');
    }
  };

  // Avatar variant - single image, circular
  if (variant === 'avatar') {
    const currentImage = existingImages[0];

    return (
      <div className={`flex flex-col items-center ${className}`}>
        <div className="relative group">
          <div
            className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
              isDragging
                ? 'border-purple-500 bg-purple-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            ) : currentImage ? (
              <Image src={currentImage.url} alt="Avatar" fill className="object-cover" />
            ) : (
              <ImageIcon className="h-8 w-8 text-white/40" />
            )}
          </div>

          {currentImage && !isUploading && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(currentImage.publicId);
              }}
              className="absolute -top-1 -right-1 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-3 w-3 text-white" />
            </button>
          )}
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 text-sm text-purple-400 hover:text-purple-300"
          disabled={isUploading}
        >
          {currentImage ? 'Change Photo' : 'Upload Photo'}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    );
  }

  // Cover variant - single wide image
  if (variant === 'cover') {
    const currentImage = existingImages[0];

    return (
      <div className={className}>
        <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>

        <div
          className={`relative aspect-[3/1] rounded-xl border-2 border-dashed overflow-hidden transition-all cursor-pointer ${
            isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
            </div>
          ) : currentImage ? (
            <>
              <Image src={currentImage.url} alt="Cover" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white font-medium">Change Cover</span>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-white/40 mb-2" />
              <span className="text-sm text-white/50">Click or drag to upload cover</span>
            </div>
          )}
        </div>

        {currentImage && (
          <button
            onClick={() => handleRemove(currentImage.publicId)}
            className="mt-2 text-sm text-red-400 hover:text-red-300"
          >
            Remove Cover
          </button>
        )}

        <p className="text-xs text-white/40 mt-1">{hint}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>
    );
  }

  // Default variant - multiple image grid
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-purple-500 bg-purple-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-purple-400 animate-spin mb-3" />
            <p className="text-white/70">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-white/40 mx-auto mb-3" />
            <p className="text-white/70 mb-1">
              {existingImages.length >= maxFiles
                ? 'Maximum images reached'
                : 'Click or drag images here'}
            </p>
            <p className="text-xs text-white/40">{hint}</p>
            <p className="text-xs text-white/40 mt-1">
              {existingImages.length} / {maxFiles} images
            </p>
          </>
        )}
      </div>

      {/* Image Grid */}
      {existingImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {existingImages.map((image) => (
            <div
              key={image.publicId}
              className="relative group aspect-square rounded-lg overflow-hidden border border-white/10"
            >
              <Image src={image.url} alt="Uploaded image" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(image.publicId);
                  }}
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        disabled={existingImages.length >= maxFiles}
      />
    </div>
  );
}

export default ImageUpload;

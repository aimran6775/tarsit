'use client';

import { useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Star,
  Trash2,
  Loader2,
  Upload,
  Info,
  CheckCircle,
  AlertCircle,
  Camera,
  Pencil,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { uploadApi, validateImageFile } from '@/lib/api/upload.api';
import { toast } from 'sonner';

interface Photo {
  id: string;
  url: string;
  caption?: string;
  featured: boolean;
  order: number;
}

interface PhotosTabProps {
  businessId: string;
  photos: Photo[];
  coverImage?: string;
  logoImage?: string;
  onPhotosUpdated: () => void;
}

export function PhotosTab({
  businessId,
  photos,
  coverImage,
  logoImage,
  onPhotosUpdated,
}: PhotosTabProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingType, setUploadingType] = useState<'photos' | 'cover' | 'logo' | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingFeatured, setSettingFeatured] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ total: number; completed: number } | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [captionText, setCaptionText] = useState('');
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handlePhotoUpload(files);
    }
  }, []);

  // Handle business photo upload
  const handlePhotoUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = 20 - photos.length;

    if (fileArray.length > remainingSlots) {
      toast.error(`Can only upload ${remainingSlots} more photos`);
      return;
    }

    // Validate all files
    for (const file of fileArray) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    setIsUploading(true);
    setUploadingType('photos');
    setUploadProgress({ total: fileArray.length, completed: 0 });

    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        try {
          // Upload to Cloudinary
          const uploaded = await uploadApi.uploadImage(file, 'businesses');

          // Save to database
          await apiClient.post('/photos', {
            businessId,
            url: uploaded.secureUrl,
            thumbnail: uploaded.secureUrl,
          });

          successCount++;
          setUploadProgress({ total: fileArray.length, completed: i + 1 });
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Uploaded ${successCount} photo${successCount > 1 ? 's' : ''}`);
        onPhotosUpdated();
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} photo${failCount > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
      setUploadProgress(null);
    }
  };

  // Handle caption update
  const handleUpdateCaption = async (photoId: string) => {
    try {
      await apiClient.patch(`/photos/${photoId}`, { caption: captionText });
      toast.success('Caption updated');
      setEditingCaption(null);
      setCaptionText('');
      onPhotosUpdated();
    } catch (error) {
      console.error('Caption update error:', error);
      toast.error('Failed to update caption');
    }
  };

  // Handle cover image upload
  const handleCoverUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadingType('cover');

    try {
      const uploaded = await uploadApi.uploadImage(file, 'covers');

      await apiClient.patch(`/businesses/${businessId}`, {
        coverImage: uploaded.secureUrl,
      });

      toast.success('Cover image updated');
      onPhotosUpdated();
    } catch (error) {
      console.error('Cover upload error:', error);
      toast.error('Failed to upload cover image');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  // Handle logo image upload
  const handleLogoUpload = async (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setIsUploading(true);
    setUploadingType('logo');

    try {
      const uploaded = await uploadApi.uploadImage(file, 'logos');

      await apiClient.patch(`/businesses/${businessId}`, {
        logoImage: uploaded.secureUrl,
      });

      toast.success('Logo updated');
      onPhotosUpdated();
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
    }
  };

  // Handle photo deletion
  const handleDeletePhoto = async (photoId: string) => {
    setDeletingId(photoId);

    try {
      await apiClient.delete(`/photos/${photoId}`);
      toast.success('Photo deleted');
      onPhotosUpdated();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete photo');
    } finally {
      setDeletingId(null);
    }
  };

  // Set featured photo
  const handleSetFeatured = async (photoId: string) => {
    setSettingFeatured(photoId);

    try {
      await apiClient.patch(`/photos/${photoId}`, { featured: true });
      toast.success('Featured photo updated');
      onPhotosUpdated();
    } catch (error) {
      console.error('Set featured error:', error);
      toast.error('Failed to set featured photo');
    } finally {
      setSettingFeatured(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cover & Logo Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Branding</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Cover Image
            </label>
            <div className="relative aspect-[3/1] rounded-xl border-2 border-dashed border-white/20 overflow-hidden bg-white/5 group">
              {coverImage ? (
                <>
                  <Image
                    src={coverImage}
                    alt="Cover"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="px-4 py-2 bg-white/20 rounded-lg cursor-pointer hover:bg-white/30 transition-colors">
                      {isUploading && uploadingType === 'cover' ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <span className="text-white">Change Cover</span>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                  {isUploading && uploadingType === 'cover' ? (
                    <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-white/40 mb-2" />
                      <span className="text-sm text-white/50">Upload Cover (1200×400)</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && handleCoverUpload(e.target.files[0])}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Business Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-white/20 overflow-hidden bg-white/5 group">
                {logoImage ? (
                  <>
                    <Image
                      src={logoImage}
                      alt="Logo"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="p-2 bg-white/20 rounded-full cursor-pointer hover:bg-white/30 transition-colors">
                        {isUploading && uploadingType === 'logo' ? (
                          <Loader2 className="h-4 w-4 animate-spin text-white" />
                        ) : (
                          <Upload className="h-4 w-4 text-white" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors">
                    {isUploading && uploadingType === 'logo' ? (
                      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-white/40" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
              <div>
                <p className="text-sm text-white/70">Square image works best</p>
                <p className="text-xs text-white/40">Recommended: 200×200px</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Photo Gallery</h3>
            <p className="text-sm text-white/50">{photos.length} / 20 photos</p>
          </div>

          {photos.length < 20 && (
            <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-xl cursor-pointer hover:from-purple-600 hover:to-indigo-600 transition-all">
              {isUploading && uploadingType === 'photos' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {uploadProgress ? `${uploadProgress.completed}/${uploadProgress.total}` : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Add Photos
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                disabled={isUploading}
              />
            </label>
          )}
        </div>

        {/* Upload Progress Bar */}
        {uploadProgress && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-white/70">Uploading photos...</span>
              <span className="text-purple-400">{Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          ref={dropZoneRef}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl transition-all mb-6 ${isDragging
              ? 'border-purple-500 bg-purple-500/10'
              : 'border-white/20 hover:border-white/30'
            }`}
        >
          <div className="p-8 text-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${isDragging ? 'bg-purple-500/20' : 'bg-white/5'
              }`}>
              <Camera className={`h-8 w-8 ${isDragging ? 'text-purple-400' : 'text-white/40'}`} />
            </div>
            <p className={`font-medium mb-1 ${isDragging ? 'text-purple-400' : 'text-white/70'}`}>
              {isDragging ? 'Drop photos here' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-white/40 mb-4">
              or click the "Add Photos" button above
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                JPG, PNG, WebP
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-400" />
                Max 10MB each
              </span>
              <span className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3 text-amber-400" />
                {20 - photos.length} slots left
              </span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl mb-6">
          <Info className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-white/80">
              Photos help customers understand your business better.
            </p>
            <p className="text-white/50 mt-1">
              Click the star icon to set a photo as featured. Featured photos appear first in search results.
            </p>
          </div>
        </div>

        {/* Photo Grid */}
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${photo.featured
                    ? 'border-amber-500 ring-2 ring-amber-500/20'
                    : 'border-transparent hover:border-white/20'
                  }`}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption || 'Business photo'}
                  fill
                  className="object-cover"
                />

                {/* Featured Badge */}
                {photo.featured && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 text-white fill-white" />
                    <span className="text-xs text-white font-medium">Featured</span>
                  </div>
                )}

                {/* Caption */}
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs text-white truncate">{photo.caption}</p>
                  </div>
                )}

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center gap-2">
                    {/* Set Featured */}
                    {!photo.featured && (
                      <button
                        onClick={() => handleSetFeatured(photo.id)}
                        disabled={settingFeatured === photo.id}
                        className="p-2 bg-amber-500 rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50"
                        title="Set as featured"
                      >
                        {settingFeatured === photo.id ? (
                          <Loader2 className="h-4 w-4 text-white animate-spin" />
                        ) : (
                          <Star className="h-4 w-4 text-white" />
                        )}
                      </button>
                    )}

                    {/* Edit Caption */}
                    <button
                      onClick={() => {
                        setEditingCaption(photo.id);
                        setCaptionText(photo.caption || '');
                      }}
                      className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 transition-colors"
                      title="Edit caption"
                    >
                      <Pencil className="h-4 w-4 text-white" />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={deletingId === photo.id}
                      className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                      title="Delete photo"
                    >
                      {deletingId === photo.id ? (
                        <Loader2 className="h-4 w-4 text-white animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Caption Edit Modal */}
                {editingCaption === photo.id && (
                  <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-3">
                    <input
                      type="text"
                      value={captionText}
                      onChange={(e) => setCaptionText(e.target.value)}
                      placeholder="Add a caption..."
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleUpdateCaption(photo.id)}
                        className="px-3 py-1 bg-purple-500 text-white text-xs rounded-lg hover:bg-purple-600"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCaption(null);
                          setCaptionText('');
                        }}
                        className="px-3 py-1 bg-white/10 text-white text-xs rounded-lg hover:bg-white/20"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-xl">
            <ImageIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-2">No photos yet</p>
            <p className="text-sm text-white/40">
              Upload photos to showcase your business
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotosTab;

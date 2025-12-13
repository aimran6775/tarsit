'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Image as ImageIcon,
  Star,
  Trash2,
  Loader2,
  Upload,
  X,
  Info,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { uploadApi, validateImageFile, UploadedImage } from '@/lib/api/upload.api';
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

    try {
      for (const file of fileArray) {
        // Upload to Cloudinary
        const uploaded = await uploadApi.uploadImage(file, 'businesses');
        
        // Save to database
        await apiClient.post('/photos', {
          businessId,
          url: uploaded.secureUrl,
          thumbnail: uploaded.secureUrl, // Cloudinary auto-generates thumbnails
        });
      }

      toast.success(`Uploaded ${fileArray.length} photo${fileArray.length > 1 ? 's' : ''}`);
      onPhotosUpdated();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photos');
    } finally {
      setIsUploading(false);
      setUploadingType(null);
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
                  Uploading...
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
                className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                  photo.featured
                    ? 'border-amber-500'
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

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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

'use client';

import { useState, useRef } from 'react';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImagePreview?: (preview: string) => void;
  maxSize?: number; // in bytes
  acceptedFormats?: string[];
  label?: string;
  placeholder?: string;
}

export function ImageUpload({
  onImageSelect,
  onImagePreview,
  maxSize = 5242880, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  label = 'Upload Image',
  placeholder = 'Drag & drop or click to upload',
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setError(null);

    // Validate format
    if (!acceptedFormats.includes(file.type)) {
      setError('Invalid file format. Please upload an image.');
      return;
    }

    // Validate size
    if (file.size > maxSize) {
      setError(`File size must be less than ${(maxSize / 1024 / 1024).toFixed(1)}MB`);
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;
      setPreview(previewUrl);
      onImagePreview?.(previewUrl);
      setIsLoading(false);
    };
    reader.readAsDataURL(file);

    // Call callback
    onImageSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setFileName(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {label && (
        <p className="text-sm font-bold text-primary/60 uppercase tracking-wider mb-3 block">
          {label}
        </p>
      )}

      {preview ? (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-xl border-2 border-primary/20"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-3">
            <button
              onClick={handleClick}
              className="size-10 rounded-full bg-white text-primary flex items-center justify-center hover:bg-slate-100 transition-colors"
              title="Change image"
            >
              <MaterialIcon name="edit" className="text-lg" />
            </button>
            <button
              onClick={handleRemoveImage}
              className="size-10 rounded-full bg-error text-white flex items-center justify-center hover:bg-error/80 transition-colors"
              title="Remove image"
            >
              <MaterialIcon name="delete" className="text-lg" />
            </button>
          </div>
          {fileName && (
            <p className="text-xs text-slate-600 mt-2 truncate flex items-center gap-1">
              <MaterialIcon name="attachment" className="text-sm" />
              {fileName}
            </p>
          )}
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-primary bg-primary/10'
              : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
          }`}
        >
          {isLoading ? (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary mx-auto animate-spin"></div>
              <p className="text-sm text-primary/60 font-medium">Processing image...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <MaterialIcon
                name="cloud_upload"
                className={`text-5xl mx-auto transition-transform ${
                  isDragging ? 'text-primary scale-110' : 'text-primary/40'
                }`}
              />
              <div>
                <p className="text-sm text-primary/70 font-medium">{placeholder}</p>
                <p className="text-xs text-primary/40 mt-1">
                  {acceptedFormats.includes('image/jpeg') ? 'JPG, PNG, WebP' : 'Image formats'} • Max{' '}
                  {(maxSize / 1024 / 1024).toFixed(1)}MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 p-3 bg-error/10 border border-error/30 rounded-lg flex items-center gap-2 text-error text-sm">
          <MaterialIcon name="error" className="text-lg flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}

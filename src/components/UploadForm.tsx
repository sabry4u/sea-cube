'use client';

import { useRef, useState } from 'react';
import { Location, ConfidenceThreshold } from '@/lib/types';

interface UploadFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading: boolean;
}

const LOCATIONS: { value: Location; label: string }[] = [
  { value: 'mediterranean', label: 'Mediterranean Sea' },
  { value: 'caribbean', label: 'Caribbean Sea' },
  { value: 'pacific', label: 'Pacific Ocean' },
];

const THRESHOLDS: { value: ConfidenceThreshold; label: string }[] = [
  { value: 50, label: '50% - Low (finds more objects)' },
  { value: 65, label: '65% - Medium (balanced)' },
  { value: 80, label: '80% - High (more precise)' },
  { value: 95, label: '95% - Very High (strict)' },
];

export default function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [location, setLocation] = useState<Location>('mediterranean');
  const [threshold, setThreshold] = useState<ConfidenceThreshold>(65);
  const [fileName, setFileName] = useState<string>('');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : '');

    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    formData.append('location', location);
    formData.append('confidenceThreshold', String(threshold));
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1.5">
          Select Location
        </label>
        <select
          id="location"
          value={location}
          onChange={(e) => setLocation(e.target.value as Location)}
          disabled={isLoading}
          className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-3 text-base text-gray-100 shadow-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-colors"
        >
          {LOCATIONS.map((loc) => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="threshold" className="block text-sm font-medium text-gray-300 mb-1.5">
          Confidence Threshold
        </label>
        <select
          id="threshold"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value) as ConfidenceThreshold)}
          disabled={isLoading}
          className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-3 text-base text-gray-100 shadow-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none transition-colors"
        >
          {THRESHOLDS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Upload Image
        </label>
        <label
          htmlFor="image-upload"
          className={`flex flex-col items-center justify-center w-full min-h-[8rem] border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ${
            preview
              ? 'border-cyan-400 bg-cyan-900/20 p-2'
              : 'border-[#2a3060] bg-[#0f1330] hover:bg-[#161b40] active:bg-[#1c2250] p-4'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {preview ? (
            <div className="flex items-center gap-3 w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <svg className="w-5 h-5 text-cyan-400 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-cyan-300 font-medium truncate">{fileName}</p>
                <p className="text-xs text-gray-500 mt-0.5">Tap to change</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <svg className="w-10 h-10 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-300">Choose Image or Take Photo</p>
              <p className="text-xs text-gray-500 mt-0.5">JPEG, PNG, GIF, or WebP up to 10MB</p>
            </div>
          )}
          <input
            id="image-upload"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            capture="environment"
            onChange={handleFileChange}
            disabled={isLoading}
            className="hidden"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!fileName || isLoading}
        className="w-full rounded-lg bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-3.5 text-base text-white font-semibold shadow-sm hover:from-cyan-400 hover:to-violet-400 active:from-cyan-600 active:to-violet-600 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-[#1a1f3e] focus:outline-none disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed transition-all"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Image'}
      </button>
    </form>
  );
}
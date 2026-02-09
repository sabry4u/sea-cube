'use client';

import { useState } from 'react';
import UploadForm from '@/components/UploadForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import ResultModal from '@/components/ResultModal';
import ReviewRequestForm from '@/components/ReviewRequestForm';
import ContactForm from '@/components/ContactForm';
import { AnalysisResponse } from '@/lib/types';
import { enhanceUnderwaterImage, dataUrlToFile } from '@/lib/enhance';

type AppState = 'idle' | 'loading' | 'result' | 'review' | 'contact';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function Home() {
  const [state, setState] = useState<AppState>('idle');
  const [response, setResponse] = useState<AnalysisResponse | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [lastFormData, setLastFormData] = useState<{
    location: string;
    objectDetected: string;
    confidence: number;
  } | null>(null);

  async function handleSubmit(formData: FormData) {
    setState('loading');
    setResponse(null);

    try {
      // Read original image and enhance before sending to API
      const imageFile = formData.get('image') as File;
      const originalDataUrl = await readFileAsDataUrl(imageFile);
      setOriginalImage(originalDataUrl);

      const enhancedDataUrl = await enhanceUnderwaterImage(originalDataUrl);
      setEnhancedImage(enhancedDataUrl);

      // Build new FormData with the enhanced image
      const enhancedFile = dataUrlToFile(enhancedDataUrl, imageFile.name);
      const enhancedFormData = new FormData();
      enhancedFormData.append('image', enhancedFile);
      enhancedFormData.append('location', formData.get('location') as string);
      enhancedFormData.append('confidenceThreshold', formData.get('confidenceThreshold') as string);

      const res = await fetch('/api/analyze-image', {
        method: 'POST',
        body: enhancedFormData,
      });
      const data: AnalysisResponse = await res.json();
      setResponse(data);

      // Store context for potential review form
      setLastFormData({
        location: formData.get('location') as string,
        objectDetected: data.result?.objectType ?? 'unknown',
        confidence: data.result?.objectConfidence ?? 0,
      });

      setState('result');
    } catch {
      setResponse({
        success: false,
        error: {
          code: '5.1',
          message: 'Network error. Please check your connection and try again.',
        },
      });
      setState('result');
    }
  }

  function handleClose() {
    setState('idle');
    setResponse(null);
    setOriginalImage(null);
    setEnhancedImage(null);
  }

  function handleRequestReview() {
    setState('review');
  }

  function handleContact() {
    setState('contact');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#111338] to-[#0d1130]">
      <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Sea Cube"
            className="h-20 sm:h-24 mx-auto mb-3"
          />
          <p className="text-cyan-300 text-sm sm:text-base font-medium tracking-wide">
            Click &rarr; Check &rarr; Connect
          </p>
        </div>

        {/* Main content area */}
        <div className="rounded-2xl bg-[#1a1f3e]/80 shadow-lg border border-[#2a3060] p-6 backdrop-blur-sm animate-glow">
          {state === 'loading' ? (
            <LoadingSpinner />
          ) : (
            <UploadForm onSubmit={handleSubmit} isLoading={false} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Powered by Claude AI &bull; Cloudflare D1
        </p>
      </div>

      {/* Result modal overlay */}
      {state === 'result' && response && (
        <ResultModal
          response={response}
          onClose={handleClose}
          onRequestReview={handleRequestReview}
          onContact={handleContact}
        />
      )}

      {/* Contact form overlay */}
      {state === 'contact' && response?.result && originalImage && enhancedImage && (
        <ContactForm
          result={response.result}
          originalImage={originalImage}
          enhancedImage={enhancedImage}
          onClose={handleClose}
        />
      )}

      {/* Review form overlay */}
      {state === 'review' && lastFormData && (
        <ReviewRequestForm
          location={lastFormData.location}
          objectDetected={lastFormData.objectDetected}
          confidence={lastFormData.confidence}
          onClose={handleClose}
        />
      )}
    </main>
  );
}
'use client';

import { useEffect, useRef, useState } from 'react';
import { AnalysisSuccess, ReviewResponse } from '@/lib/types';

interface ContactFormProps {
  result: AnalysisSuccess;
  originalImage: string;
  enhancedImage: string;
  onClose: () => void;
}

export default function ContactForm({ result, originalImage, enhancedImage, onClose }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ReviewResponse | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the enhanced image with bounding box overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      // Draw bounding box if available
      if (result.boundingBox) {
        const { x, y, width, height } = result.boundingBox;
        const bx = x * img.width;
        const by = y * img.height;
        const bw = width * img.width;
        const bh = height * img.height;

        // Draw rectangle
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = Math.max(2, Math.round(img.width / 200));
        ctx.strokeRect(bx, by, bw, bh);

        // Draw label background
        const label = `${result.objectType} ${result.objectConfidence}%`;
        const fontSize = Math.max(12, Math.round(img.width / 30));
        ctx.font = `bold ${fontSize}px sans-serif`;
        const textMetrics = ctx.measureText(label);
        const pad = fontSize * 0.3;
        const labelHeight = fontSize + pad * 2;
        const labelWidth = textMetrics.width + pad * 2;

        // Position label above the box, or inside if near top edge
        const labelY = by > labelHeight + 4 ? by - labelHeight - 2 : by + 2;

        ctx.fillStyle = 'rgba(0, 229, 255, 0.85)';
        ctx.fillRect(bx, labelY, labelWidth, labelHeight);

        ctx.fillStyle = '#000';
        ctx.textBaseline = 'top';
        ctx.fillText(label, bx + pad, labelY + pad);
      }
    };
    img.src = enhancedImage;
  }, [enhancedImage, result.boundingBox, result.objectType, result.objectConfidence]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/contact-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          comments,
          teamName: result.teamName,
          objectType: result.objectType,
          objectConfidence: result.objectConfidence,
        }),
      });
      const data: ReviewResponse = await res.json();
      setSubmitResult(data);
    } catch {
      setSubmitResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#1a1f3e] shadow-xl animate-slide-up">
        {/* Header */}
        <div className="bg-green-500 px-6 py-4 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">
            Contact {result.teamName}
          </h2>
        </div>

        <div className="px-6 py-5 space-y-5">
          {submitResult ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 border ${
                  submitResult.success
                    ? 'bg-green-900/30 border-green-700 text-green-300'
                    : 'bg-red-900/30 border-red-700 text-red-300'
                }`}
              >
                <p>{submitResult.message}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-[#2a3060] px-4 py-3 text-gray-300 font-semibold hover:bg-[#343b70] transition-colors"
              >
                OK
              </button>
            </div>
          ) : (
            <>
              {/* Image comparison */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-300">Image Comparison</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 text-center">Original</p>
                    <div className="rounded-lg overflow-hidden border border-[#2a3060] bg-[#0f1330]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalImage}
                        alt="Original upload"
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 text-center">Enhanced + Detection</p>
                    <div className="rounded-lg overflow-hidden border border-cyan-700 bg-[#0f1330]">
                      <canvas
                        ref={canvasRef}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detection info */}
              <div className="rounded-lg bg-[#0f1330] border border-[#2a3060] p-3 text-sm text-gray-400 space-y-1">
                <p><span className="font-medium text-gray-300">Team:</span> {result.teamName}</p>
                <p><span className="font-medium text-gray-300">Object:</span> <span className="capitalize">{result.objectType}</span></p>
                <p><span className="font-medium text-gray-300">Confidence:</span> {result.objectConfidence}%</p>
              </div>

              {/* Contact form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-2.5 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-2.5 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="contact-comments" className="block text-sm font-medium text-gray-300 mb-1">
                    Comments
                  </label>
                  <textarea
                    id="contact-comments"
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-2.5 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none resize-none"
                    placeholder="Describe your finding or ask a question..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-[#2a3060] px-4 py-3 text-gray-300 font-semibold hover:bg-[#343b70] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-green-500 px-4 py-3 text-white font-semibold hover:bg-green-600 disabled:bg-gray-600 transition-colors"
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
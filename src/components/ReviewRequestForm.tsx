'use client';

import { useState } from 'react';
import { ReviewResponse } from '@/lib/types';

interface ReviewRequestFormProps {
  location: string;
  objectDetected: string;
  confidence: number;
  onClose: () => void;
}

export default function ReviewRequestForm({
  location,
  objectDetected,
  confidence,
  onClose,
}: ReviewRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ReviewResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/submit-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          location,
          objectDetected,
          confidence,
          timestamp: new Date().toISOString(),
        }),
      });
      const data: ReviewResponse = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1f3e] shadow-xl overflow-hidden">
        <div className="bg-yellow-500 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Submit Review Request</h2>
        </div>

        <div className="px-6 py-5">
          {result ? (
            <div className="space-y-4">
              <div
                className={`rounded-lg p-4 border ${
                  result.success
                    ? 'bg-green-900/30 border-green-700 text-green-300'
                    : 'bg-red-900/30 border-red-700 text-red-300'
                }`}
              >
                <p>{result.message}</p>
              </div>
              <button
                onClick={onClose}
                className="w-full rounded-lg bg-[#2a3060] px-4 py-3 text-gray-300 font-semibold hover:bg-[#343b70] transition-colors"
              >
                OK
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-gray-400">
                No team matched your image. Fill out this form and we&apos;ll review your submission.
              </p>

              <div>
                <label htmlFor="review-name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="review-name"
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
                <label htmlFor="review-email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="review-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-lg border border-[#2a3060] bg-[#0f1330] px-4 py-2.5 text-gray-100 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 focus:outline-none"
                  placeholder="your@email.com"
                />
              </div>

              <div className="rounded-lg bg-[#0f1330] border border-[#2a3060] p-3 text-sm text-gray-400 space-y-1">
                <p><span className="font-medium text-gray-300">Location:</span> {location}</p>
                <p><span className="font-medium text-gray-300">Object detected:</span> {objectDetected}</p>
                <p><span className="font-medium text-gray-300">Confidence:</span> {confidence}%</p>
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
                  className="flex-1 rounded-lg bg-yellow-500 px-4 py-3 text-white font-semibold hover:bg-yellow-600 disabled:bg-gray-600 transition-colors"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
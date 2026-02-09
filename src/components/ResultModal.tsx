'use client';

import { AnalysisResponse } from '@/lib/types';

interface ResultModalProps {
  response: AnalysisResponse;
  onClose: () => void;
  onRequestReview: () => void;
  onContact: () => void;
}

export default function ResultModal({ response, onClose, onRequestReview, onContact }: ResultModalProps) {
  const isSuccess = response.success && response.result;
  const isWarning = response.error?.code === '5.5';
  const isError = response.error && !isWarning;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1a1f3e] shadow-xl overflow-hidden animate-slide-up">
        {/* Header bar */}
        <div
          className={`px-6 py-4 ${
            isSuccess
              ? 'bg-green-500'
              : isWarning
                ? 'bg-yellow-500'
                : 'bg-red-500'
          }`}
        >
          <h2 className="text-lg font-bold text-white">
            {isSuccess ? 'Match Found!' : isWarning ? 'No Match' : 'Error'}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {/* Success state */}
          {isSuccess && response.result && (
            <div className="space-y-3">
              <p className="text-gray-200">
                Your image matched the archaeology team{' '}
                <span className="font-bold text-cyan-300">&lsquo;{response.result.teamName}&rsquo;</span>
                {' '}&mdash; {response.result.projectName}
              </p>
              <div className="rounded-lg bg-green-900/30 border border-green-700 p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Object</span>
                  <span className="text-sm font-semibold text-gray-100 capitalize">
                    {response.result.objectType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Object Confidence</span>
                  <span className="text-sm font-semibold text-gray-100">
                    {response.result.objectConfidence}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Man-Made Confidence</span>
                  <span className="text-sm font-semibold text-gray-100">
                    {response.result.manMadeConfidence}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Warning state (5.5 - no team match) */}
          {isWarning && response.error && (
            <div className="space-y-4">
              <p className="text-gray-200">{response.error.message}</p>
              <button
                onClick={onRequestReview}
                className="w-full rounded-lg bg-yellow-500 px-4 py-3 text-white font-semibold hover:bg-yellow-600 transition-colors"
              >
                Submit Review Request
              </button>
            </div>
          )}

          {/* Error states (5.1 - 5.4) */}
          {isError && response.error && (
            <div className="rounded-lg bg-red-900/30 border border-red-700 p-4">
              <p className="text-red-300">{response.error.message}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          {isSuccess ? (
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg bg-[#2a3060] px-4 py-3 text-gray-300 font-semibold hover:bg-[#343b70] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onContact}
                className="flex-1 rounded-lg bg-green-500 px-4 py-3 text-white font-semibold hover:bg-green-600 transition-colors"
              >
                Contact
              </button>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-[#2a3060] px-4 py-3 text-gray-300 font-semibold hover:bg-[#343b70] transition-colors"
            >
              OK
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
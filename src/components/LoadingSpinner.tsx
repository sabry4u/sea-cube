const STEPS = [
  'Running safety checks',
  'Verifying underwater image',
  'Detecting man-made objects',
  'Identifying object type',
  'Searching team database',
];

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 rounded-full border-4 border-[#2a3060]" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-cyan-400 animate-spin" />
      </div>
      <p className="text-gray-200 font-semibold mb-4">Analyzing image...</p>
      <div className="w-full space-y-2.5">
        {STEPS.map((step, i) => (
          <div
            key={step}
            className="flex items-center gap-2.5 animate-progress-pulse"
            style={{ animationDelay: `${i * 0.4}s` }}
          >
            <div className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
            <span className="text-sm text-gray-400">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
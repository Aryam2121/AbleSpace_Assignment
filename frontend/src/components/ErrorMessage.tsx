export default function ErrorMessage({ 
  message, 
  retry 
}: { 
  message: string; 
  retry?: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg 
          className="w-12 h-12 text-red-500 mx-auto mb-4" 
          fill="none" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Oops! Something went wrong
        </h3>
        <p className="text-red-700 mb-4">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

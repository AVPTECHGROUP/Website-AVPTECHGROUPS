const CardLoader = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4  shadow-sm overflow-hidden">
      {/* Icon placeholder */}
      <div className="w-10 h-10 rounded-lg bg-gray-200 shimmer shrink-0" />

      {/* Text placeholders */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-3 w-3/4 rounded bg-gray-200 shimmer" />
        <div className="h-5 w-1/3 rounded bg-gray-200 shimmer" />
      </div>

      <style>{`
        .shimmer {
          background: linear-gradient(
            90deg,
            #e5e7eb 25%,
            #f3f4f6 50%,
            #e5e7eb 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default CardLoader;
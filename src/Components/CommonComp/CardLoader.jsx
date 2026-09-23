const CardLoader = () => {
  return (
    <>
      <div className="rounded-xl overflow-hidden flex flex-col bg-white border border-gray-100 shadow-sm w-full h-18 animate-pulse">

        {/* Main Content */}
        <div className="flex items-center justify-between px-4 py-3 h-full">

          {/* Left Section */}
          <div className="flex items-center gap-3">

            {/* Icon Loader */}
            <div className="w-10 h-10 rounded-xl bg-gray-200 shimmer shrink-0" />

            {/* Text Loader */}
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 rounded bg-gray-200 shimmer" />
              <div className="h-2.5 w-16 rounded bg-gray-100 shimmer" />
            </div>
          </div>

          {/* Value Loader */}
          <div className="h-7 w-12 rounded bg-gray-200 shimmer" />
        </div>

        {/* Bottom Accent Bar */}
        <div className="h-[3px] w-full bg-gray-200 shimmer mt-auto" />
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
          animation: shimmer 1.4s ease-in-out infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
};

export default CardLoader;
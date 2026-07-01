import { Quote } from "lucide-react";
 
function StarRating({ rating = 5 }) {
  return (
    <div className="flex gap-1 mt-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill={i < rating ? "#F5A623" : "none"}
          stroke={i < rating ? "#F5A623" : "#CBD5E0"}
          strokeWidth="1.5"
          className="shrink-0"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}
 
function Avatar({ name, initials }) {
  const derived =
    initials ||
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
 
  return (
    <div
      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
      style={{
        background: "linear-gradient(135deg, #00C9B1 0%, #1A8A8A 100%)",
        color: "#fff",
      }}
    >
      {derived}
    </div>
  );
}
 
export function ReviewCard({ quote, name, role, rating = 5, initials }) {
  return (
    <div
      className="relative flex flex-col justify-between rounded-2xl p-6 h-full border border-theme-border bg-theme-card"
      style={{
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.02), 0 4px 16px rgba(0,201,177,0.05)",
      }}
    >
      {/* Quote icon */}
      <Quote
        size={28}
        className="mb-3 shrink-0"
        style={{ color: "#00C9B1", opacity: 0.55 }}
        strokeWidth={2}
      />
 
      {/* Testimonial text */}
      <p
        className="flex-1 text-base text-theme-subtext leading-relaxed italic"
        style={{ fontFamily: "var(--font-body, DM Sans, sans-serif)" }}
      >
        {quote}
      </p>
 
      {/* Author row */}
      <div className="mt-5 flex items-center gap-3">
        <Avatar name={name} initials={initials} />
        <div className="min-w-0">
          <p
            className="font-semibold text-sm truncate text-theme-text"
          >
            {name}
          </p>
          <p
            className="text-xs truncate text-theme-subtext"
          >
            {role}
          </p>
        </div>
      </div>
 
      {/* Stars */}
      <StarRating rating={rating} />
    </div>
  );
}
 
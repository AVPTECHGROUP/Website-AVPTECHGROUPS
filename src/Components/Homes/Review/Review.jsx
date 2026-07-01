import React, { useState, useEffect, useRef } from 'react';
import { ReviewCard } from './ReviewCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    quote: "SchoolSpine has completely transformed how we manage our school. The automation saves us hours every week, and parents love the real-time updates.",
    name: "Dr. Priya Sharma",
    role: "Principal, Delhi Public School",
    rating: 5,
  },
  {
    quote: "The fee collection module alone has improved our collection rate by 40%. The parent app makes it so easy for them to pay on time.",
    name: "Rajesh Kumar",
    role: "Administrator, Ryan International",
    rating: 5,
  },
  {
    quote: "As a teacher, I can focus more on teaching now. Attendance, grades, everything is just a few clicks away. Absolutely love it!",
    name: "Anita Desai",
    role: "Senior Teacher, Modern School",
    rating: 5,
  },
  {
    quote: "The analytics dashboard gives us incredible insight into student performance trends. We've been able to intervene early and improve outcomes significantly.",
    name: "Sunita Mehta",
    role: "Academic Head, Lotus Valley International",
    rating: 5,
  },
  {
    quote: "Onboarding was seamless and the support team is phenomenal. SchoolSpine feels like it was designed for schools like ours from day one.",
    name: "Vikram Nair",
    role: "Director, The Orchid School",
    rating: 5,
  },
  {
    quote: "The timetable and substitute management features alone are worth it. Our coordinators used to spend entire mornings on scheduling — now it's minutes.",
    name: "Deepa Krishnamurthy",
    role: "Vice Principal, Greenwood High",
    rating: 5,
  },
];

const Review = () => {
  const [current, setCurrent] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const isPausedRef = useRef(false);
  const trackRef = useRef(null);

  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setPerPage(1);
      else if (window.innerWidth < 1024) setPerPage(2);
      else setPerPage(3);
    }
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const maxIndex = reviews.length - perPage;

  function goTo(index) {
    const clamped = Math.max(0, Math.min(index, maxIndex));
    setCurrent(clamped);
    if (trackRef.current) {
      const cardWidth = trackRef.current.offsetWidth / perPage;
      trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
      trackRef.current.style.transform = `translateX(-${clamped * cardWidth}px)`;
    }
  }

  function goNext() {
    const next = current >= maxIndex ? 0 : current + 1;
    if (current >= maxIndex) {
      if (trackRef.current) {
        trackRef.current.style.transition = 'none';
        trackRef.current.style.transform = `translateX(0px)`;
      }
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setCurrent(0);
          if (trackRef.current) {
            trackRef.current.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1)';
            trackRef.current.style.transform = `translateX(0px)`;
          }
        });
      });
    } else {
      goTo(next);
    }
  }

  function goPrev() {
    goTo(current <= 0 ? 0 : current - 1);
  }

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transition = 'none';
      const cardWidth = trackRef.current.offsetWidth / perPage;
      trackRef.current.style.transform = `translateX(-${current * cardWidth}px)`;
    }
  }, [perPage]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!isPausedRef.current) goNext();
    }, 4000);
    return () => clearInterval(id);
  }, [current, perPage]);

  const dots = Array.from({ length: maxIndex + 1 }, (_, i) => i);
  const cardWidthPct = 100 / perPage;

  return (
    // ─── ADDED: id="reviews-section" HERE ───
    <div id="reviews-section" className="w-full bg-theme-bg text-theme-text relative py-12 overflow-hidden transition-colors duration-300">

      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-5 px-4 mb-10">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium tracking-wider text-theme-text text-center">
          Built for educators, loved by schools
        </h1>
        <p className="text-base sm:text-lg font-accent font-light text-theme-subtext text-center">
          See what school administrators and teachers are saying about SchoolSpine.
        </p>
      </div>

      {/* Carousel */}
      <div
        className="relative max-w-5xl mx-auto px-10 sm:px-14"
        onMouseEnter={() => { isPausedRef.current = true; }}
        onMouseLeave={() => { isPausedRef.current = false; }}
      >
        {/* Overflow clip */}
        <div className="overflow-hidden rounded-2xl">
          <div
            ref={trackRef}
            className="flex"
            style={{ transform: 'translateX(0px)' }}
          >
            {reviews.map((r, i) => (
              <div
                key={i}
                className="shrink-0 px-3 py-4 box-border"
                style={{ width: `${cardWidthPct}%` }}
              >
                <div className="transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-[0_8px_32px_rgba(0,201,177,0.18)] hover:z-10 relative rounded-2xl h-full">
                  <ReviewCard {...r} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prev */}
        <button
          onClick={goPrev}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-theme-card border border-theme-border text-teal flex items-center justify-center shadow-sm hover:shadow-[0_4px_16px_rgba(0,201,177,0.2)] hover:scale-110 hover:border-teal transition-all duration-200 cursor-pointer z-10"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>

        {/* Next */}
        <button
          onClick={goNext}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-theme-card border border-theme-border text-teal flex items-center justify-center shadow-sm hover:shadow-[0_4px_16px_rgba(0,201,177,0.2)] hover:scale-110 hover:border-teal transition-all duration-200 cursor-pointer z-10"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex justify-center items-center gap-2 mt-8">
        {dots.map((i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={'Slide ' + (i + 1)}
            className={`h-2 rounded-full border-0 p-0 cursor-pointer transition-all duration-300 ${i === current ? 'w-6 bg-teal' : 'w-2 bg-teal/30 hover:bg-teal/60'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Review;
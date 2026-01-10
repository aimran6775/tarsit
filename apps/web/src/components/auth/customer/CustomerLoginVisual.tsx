'use client';

import { useState, useEffect } from 'react';
import { Star, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "Found my dream salon in just 5 minutes! The booking process was seamless.",
    author: "Sarah Mitchell",
    role: "San Francisco, CA",
    rating: 5,
    avatar: "SM",
  },
  {
    quote: "Finally, a platform that makes finding trusted local services actually easy.",
    author: "Michael Chen",
    role: "Los Angeles, CA",
    rating: 5,
    avatar: "MC",
  },
  {
    quote: "Booked a home repair service at 10pm, they arrived the next morning. Amazing!",
    author: "Emily Rodriguez",
    role: "New York, NY",
    rating: 5,
    avatar: "ER",
  },
  {
    quote: "The real reviews helped me find the best auto mechanic in my area.",
    author: "David Thompson",
    role: "Seattle, WA",
    rating: 5,
    avatar: "DT",
  },
];

export function CustomerLoginVisual() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const current = testimonials[currentIndex];

  return (
    <div className="text-center space-y-8">
      {/* Headline */}
      <div className="space-y-4">
        <h2 className="text-4xl font-bold text-white">
          Discover local services
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
            you'll love
          </span>
        </h2>
        <p className="text-neutral-400 text-lg max-w-sm mx-auto">
          Join 50,000+ customers finding trusted local businesses every day
        </p>
      </div>

      {/* Testimonial card */}
      <div className="relative">
        <div className={cn(
          "bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 transition-all duration-300",
          isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
        )}>
          {/* Quote icon */}
          <Quote className="h-8 w-8 text-purple-500/30 mb-4" />
          
          {/* Quote text */}
          <p className="text-white text-lg leading-relaxed mb-6">
            "{current.quote}"
          </p>
          
          {/* Author info */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold">
              {current.avatar}
            </div>
            <div className="text-left">
              <p className="text-white font-medium">{current.author}</p>
              <p className="text-neutral-500 text-sm">{current.role}</p>
            </div>
            <div className="ml-auto flex gap-0.5">
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Pagination dots */}
        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsAnimating(false);
                }, 300);
              }}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "w-6 bg-purple-500" 
                  : "bg-neutral-700 hover:bg-neutral-600"
              )}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 pt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">50K+</div>
          <div className="text-xs text-neutral-500">Happy Customers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">2,500+</div>
          <div className="text-xs text-neutral-500">Local Businesses</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">98%</div>
          <div className="text-xs text-neutral-500">Satisfaction</div>
        </div>
      </div>
    </div>
  );
}

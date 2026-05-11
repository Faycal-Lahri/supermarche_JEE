import React from 'react';

export default function SkeletonList({ lines = 3 }) {
  return (
    <div className="space-y-4 w-full">
      {[...Array(lines)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 skeleton flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-gray-100 skeleton rounded-full" />
            <div className="h-3 w-1/2 bg-gray-100 skeleton rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

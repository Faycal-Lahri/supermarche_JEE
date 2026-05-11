import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-gray-50 flex flex-col h-[350px] w-full">
      <div className="aspect-square rounded-2xl bg-gray-100 skeleton mb-4 w-full" />
      <div className="flex-1 flex flex-col">
        <div className="h-3 w-1/3 bg-gray-100 skeleton rounded-full mb-3" />
        <div className="h-5 w-3/4 bg-gray-100 skeleton rounded-full mb-2" />
        <div className="h-5 w-1/2 bg-gray-100 skeleton rounded-full mb-4" />
        <div className="mt-auto flex justify-between items-center pt-2">
          <div className="h-6 w-1/4 bg-gray-100 skeleton rounded-full" />
          <div className="h-10 w-10 bg-gray-100 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}

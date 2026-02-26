import { motion } from 'framer-motion';

// Base skeleton component
function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gray-200 dark:bg-gray-800 rounded ${className}`}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-4">
      <SkeletonBase className="w-full h-48 rounded-xl" />
      <SkeletonBase className="w-3/4 h-6" />
      <SkeletonBase className="w-full h-4" />
      <SkeletonBase className="w-1/2 h-4" />
      <div className="flex gap-2 pt-2">
        <SkeletonBase className="w-1/3 h-10" />
        <SkeletonBase className="w-2/3 h-10" />
      </div>
    </div>
  );
}

// Product card skeleton
export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <SkeletonBase className="w-full aspect-square" />
      <div className="p-4 space-y-3">
        <SkeletonBase className="w-3/4 h-5" />
        <SkeletonBase className="w-full h-4" />
        <SkeletonBase className="w-1/3 h-6" />
        <SkeletonBase className="w-full h-10 rounded-lg" />
      </div>
    </div>
  );
}

// Blog card skeleton
export function BlogCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <SkeletonBase className="w-full aspect-[4/3]" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <SkeletonBase className="w-20 h-5 rounded-full" />
          <SkeletonBase className="w-16 h-5 rounded-full" />
        </div>
        <SkeletonBase className="w-full h-6" />
        <SkeletonBase className="w-full h-4" />
        <SkeletonBase className="w-2/3 h-4" />
        <div className="flex items-center gap-3 pt-2">
          <SkeletonBase className="w-8 h-8 rounded-full" />
          <SkeletonBase className="w-32 h-4" />
        </div>
      </div>
    </div>
  );
}

// Hero skeleton
export function HeroSkeleton() {
  return (
    <div className="h-[600px] bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
      <SkeletonBase className="absolute inset-0" />
      <div className="relative max-w-7xl mx-auto px-4 h-full flex items-center">
        <div className="max-w-xl space-y-6">
          <SkeletonBase className="w-32 h-8 rounded-full" />
          <SkeletonBase className="w-full h-16" />
          <SkeletonBase className="w-full h-6" />
          <SkeletonBase className="w-2/3 h-6" />
          <SkeletonBase className="w-40 h-14 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <SkeletonBase className="w-1/4 h-6" />
          <SkeletonBase className="w-1/4 h-6" />
          <SkeletonBase className="w-1/4 h-6" />
          <SkeletonBase className="w-1/4 h-6" />
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-3">
            <SkeletonBase className="w-1/4 h-5" />
            <SkeletonBase className="w-1/4 h-5" />
            <SkeletonBase className="w-1/4 h-5" />
            <SkeletonBase className="w-1/4 h-5" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Form skeleton
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
      <SkeletonBase className="w-1/3 h-8" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase className="w-1/4 h-5" />
          <SkeletonBase className="w-full h-12 rounded-lg" />
        </div>
      ))}
      <SkeletonBase className="w-full h-12 rounded-lg" />
    </div>
  );
}

// Stats skeleton
export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-3">
          <SkeletonBase className="w-12 h-12 rounded-lg" />
          <SkeletonBase className="w-20 h-4" />
          <SkeletonBase className="w-full h-8" />
        </div>
      ))}
    </div>
  );
}

// Grid skeleton for product/blog lists
export function GridSkeleton({ count = 6, type = 'product' }: { count?: number; type?: 'product' | 'blog' | 'card' }) {
  const SkeletonComponent = type === 'blog' ? BlogCardSkeleton : type === 'card' ? CardSkeleton : ProductCardSkeleton;
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

// Text skeleton (for paragraphs)
export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines - 1 }).map((_, i) => (
        <SkeletonBase key={i} className="w-full h-4" />
      ))}
      <SkeletonBase className="w-2/3 h-4" />
    </div>
  );
}

// Image skeleton
export function ImageSkeleton({ aspectRatio = 'square' }: { aspectRatio?: 'square' | 'video' | 'wide' | 'portrait' }) {
  const ratios = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[21/9]',
    portrait: 'aspect-[3/4]',
  };
  
  return <SkeletonBase className={`w-full ${ratios[aspectRatio]}`} />;
}

// Avatar skeleton
export function AvatarSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  return <SkeletonBase className={`${sizes[size]} rounded-full`} />;
}

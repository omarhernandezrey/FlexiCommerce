'use client';

import { ReviewStats } from '@/hooks/useReviews';

interface ReviewStatsProps {
  stats: ReviewStats;
}

export default function ReviewStatsDisplay({ stats }: ReviewStatsProps) {
  const total = stats.count;

  const getPercentage = (count: number) => {
    return total === 0 ? 0 : Math.round((count / total) * 100);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Calificaciones</h3>

      {/* Average Rating */}
      <div className="mb-8 text-center pb-6 border-b border-gray-200">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {stats.average.toFixed(1)}
        </div>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= Math.round(stats.average) ? 'text-yellow-400' : 'text-gray-300'}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-500">{total} reseña{total !== 1 ? 's' : ''}</p>
      </div>

      {/* Distribution */}
      <div className="space-y-3">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = stats.distribution[stars as keyof typeof stats.distribution];
          const percentage = getPercentage(count);

          return (
            <div key={stars} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700 w-12">
                {stars} ★
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 w-12 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

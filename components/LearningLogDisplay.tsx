"use client";

import { useState, useEffect } from 'react';
import { ILearningLog } from '@/lib/mongodb/models/LearningLog';

interface LearningLogDisplayProps {
  companionId?: string;
  limit?: number;
}

const moodConfig: Record<string, { emoji: string; color: string; bg: string }> = {
  excited: { emoji: '😊', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  confident: { emoji: '💪', color: 'text-blue-600', bg: 'bg-blue-500' },
  satisfied: { emoji: '😌', color: 'text-amber-600', bg: 'bg-amber-500' },
  confused: { emoji: '🤔', color: 'text-orange-600', bg: 'bg-orange-500' },
  frustrated: { emoji: '😤', color: 'text-red-600', bg: 'bg-red-500' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`size-3.5 ${star <= rating ? 'text-amber-400' : 'text-muted-foreground/30'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function LearningLogDisplay({ companionId, limit = 5 }: LearningLogDisplayProps) {
  const [logs, setLogs] = useState<ILearningLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(companionId && { companionId })
      });
      const response = await fetch(`/api/learning-logs?${params}`);
      const data = await response.json();
      if (data.success) setLogs(data.data);
    } catch (error) {
      console.error('Failed to fetch learning logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [companionId, limit]);

  if (loading) {
    return (
      <div className="grid gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 rounded-2xl border border-border bg-card">
            <div className="w-1 rounded-full bg-muted-foreground/20 self-stretch" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded-lg w-1/2" />
              <div className="h-3 bg-muted rounded-lg w-3/4" />
              <div className="h-3 bg-muted rounded-lg w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">📝</div>
        <p className="font-semibold text-foreground">No learning logs yet</p>
        <p className="text-sm text-muted-foreground">Start documenting your learning journey above!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {logs.map((log) => {
        const mood = moodConfig[log.mood as keyof typeof moodConfig] ?? moodConfig.satisfied;
        return (
          <div
            key={log._id}
            className="relative flex gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
          >
            {/* Mood accent bar */}
            <div className={`w-1 flex-shrink-0 rounded-full ${mood.bg} opacity-80`} />

            <div className="flex-1 min-w-0">
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-foreground text-sm leading-snug line-clamp-1">{log.title}</h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-base" title={log.mood}>{mood.emoji}</span>
                  <StarRating rating={log.rating} />
                </div>
              </div>

              {/* Content */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">{log.content}</p>

              {/* Footer row */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                {log.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {log.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {new Date(log.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
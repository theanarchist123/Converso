"use client";

import { useState, useEffect } from 'react';
import { ILearningLog } from '@/lib/mongodb/models/LearningLog';

interface LearningLogDisplayProps {
  companionId?: string;
  limit?: number;
}

const moodEmojis = {
  excited: '😊',
  confident: '💪',
  satisfied: '😌',
  confused: '🤔',
  frustrated: '😤',
};

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
      
      if (data.success) {
        setLogs(data.data);
      }
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
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-24 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>No learning logs yet.</p>
        <p className="text-sm">Start documenting your learning journey!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">{log.title}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{moodEmojis[log.mood as keyof typeof moodEmojis]}</span>
              <span>{'⭐'.repeat(log.rating)}</span>
            </div>
          </div>
          
          <p className="text-gray-700 mb-3">{log.content}</p>
          
          {log.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {log.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            {new Date(log.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
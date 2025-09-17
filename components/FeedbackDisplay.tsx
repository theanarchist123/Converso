"use client";

import { useState, useEffect } from 'react';

interface Feedback {
  _id: string;
  feedbackType: string;
  title: string;
  description: string;
  rating?: number;
  tags: string[];
  status: string;
  createdAt: string;
}

export default function FeedbackDisplay() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: '',
    status: ''
  });

  const fetchFeedback = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append('type', filter.type);
      if (filter.status) params.append('status', filter.status);

      const response = await fetch(`/api/feedback?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filter]);

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'general': 'General',
      'bug_report': 'Bug Report',
      'feature_request': 'Feature Request',
      'session_review': 'Session Review'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'reviewed': 'bg-blue-100 text-blue-800',
      'resolved': 'bg-green-100 text-green-800',
      'closed': 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-600">Loading your feedback...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Your Feedback</h2>
        
        <div className="flex gap-2 ml-auto">
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="general">General</option>
            <option value="bug_report">Bug Reports</option>
            <option value="feature_request">Feature Requests</option>
            <option value="session_review">Session Reviews</option>
          </select>
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <p>No feedback found.</p>
          <p className="text-sm mt-2">Your submitted feedback will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-blue-600">
                    {getTypeLabel(item.feedbackType)}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {item.title}
              </h3>
              
              <p className="text-gray-600 mb-3 leading-relaxed">
                {item.description}
              </p>
              
              {item.rating && (
                <div className="mb-3">
                  <span className="text-sm text-gray-700 mr-2">Rating:</span>
                  {renderStars(item.rating)}
                </div>
              )}
              
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
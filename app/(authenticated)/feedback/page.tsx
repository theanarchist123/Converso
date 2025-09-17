"use client";

import { useState } from 'react';
import FeedbackForm from '@/components/FeedbackForm';
import FeedbackDisplay from '@/components/FeedbackDisplay';

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'view'>('submit');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Feedback Center
          </h1>
          <p className="text-gray-600">
            Share your thoughts and help us improve your learning experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'submit'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'view'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Feedback
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'submit' ? (
            <FeedbackForm 
              onSuccess={() => {
                // Optionally switch to view tab after successful submission
                setTimeout(() => setActiveTab('view'), 2000);
              }}
            />
          ) : (
            <FeedbackDisplay />
          )}
        </div>

        {/* Information Cards */}
        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">🐛 Report Bugs</h3>
            <p className="text-gray-600 text-sm">
              Found something not working? Let us know so we can fix it quickly.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">💡 Request Features</h3>
            <p className="text-gray-600 text-sm">
              Have an idea for improvement? Share your feature requests with us.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">⭐ Rate Sessions</h3>
            <p className="text-gray-600 text-sm">
              Help us understand how your learning sessions are going.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
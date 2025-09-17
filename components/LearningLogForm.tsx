"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LearningLogFormProps {
  companionId?: string;
  sessionId?: string;
  onSave?: () => void;
}

const moods = [
  { value: 'excited', label: '😊 Excited', color: 'text-green-600' },
  { value: 'confident', label: '💪 Confident', color: 'text-blue-600' },
  { value: 'satisfied', label: '😌 Satisfied', color: 'text-yellow-600' },
  { value: 'confused', label: '🤔 Confused', color: 'text-orange-600' },
  { value: 'frustrated', label: '😤 Frustrated', color: 'text-red-600' },
];

export default function LearningLogForm({ companionId, sessionId, onSave }: LearningLogFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    mood: 'satisfied',
    rating: 3
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/learning-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          companionId,
          sessionId,
        }),
      });

      if (response.ok) {
        // Reset form
        setFormData({
          title: '',
          content: '',
          tags: '',
          mood: 'satisfied',
          rating: 3
        });
        setIsOpen(false);
        onSave?.();
        
        // Simple success feedback
        alert('Learning log saved successfully! 🎉');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      alert('Failed to save learning log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        📝 Add Learning Log
      </Button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Add Learning Log</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(false)}
        >
          ✕
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="What did you learn today?"
            required
            maxLength={200}
          />
        </div>

        <div>
          <Label htmlFor="content">Content *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
            placeholder="Describe your learning experience, insights, or questions..."
            required
            maxLength={2000}
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="mood">How do you feel?</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData(prev => ({ ...prev, mood: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {moods.map((mood) => (
                  <SelectItem key={mood.value} value={mood.value}>
                    <span className={mood.color}>{mood.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Select value={formData.rating.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, rating: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <SelectItem key={rating} value={rating.toString()}>
                    {'⭐'.repeat(rating)} ({rating})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
            placeholder="javascript, react, learning, fun"
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : 'Save Log'}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
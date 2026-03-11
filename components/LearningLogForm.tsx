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
  { value: 'excited', label: '😊 Excited', color: 'text-emerald-500' },
  { value: 'confident', label: '💪 Confident', color: 'text-blue-500' },
  { value: 'satisfied', label: '😌 Satisfied', color: 'text-amber-500' },
  { value: 'confused', label: '🤔 Confused', color: 'text-orange-500' },
  { value: 'frustrated', label: '😤 Frustrated', color: 'text-red-500' },
];

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-125"
          aria-label={`Rate ${star} stars`}
        >
          <svg
            className={`size-6 transition-colors duration-150 ${star <= (hovered || value) ? 'text-amber-400' : 'text-muted-foreground/30'
              }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function LearningLogForm({ companionId, sessionId, onSave }: LearningLogFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    mood: 'satisfied',
    rating: 3,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/learning-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
          companionId,
          sessionId,
        }),
      });
      if (response.ok) {
        setFormData({ title: '', content: '', tags: '', mood: 'satisfied', rating: 3 });
        setIsOpen(false);
        onSave?.();
        alert('Learning log saved! 🎉');
      } else {
        throw new Error('Failed to save');
      }
    } catch {
      alert('Failed to save learning log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-md shadow-primary/25"
      >
        <svg className="size-4 transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
        Add Learning Log
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-lg animate-slideUp">
      {/* Form header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 flex items-center justify-center text-base">📝</div>
          <h3 className="font-bold text-foreground">Add Learning Log</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            placeholder="What did you learn today?"
            required
            maxLength={200}
            className="rounded-xl border-border bg-background"
          />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <Label htmlFor="content" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes *</Label>
          <Textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
            placeholder="Share your insights, aha-moments or questions..."
            required
            maxLength={2000}
            className="min-h-[100px] rounded-xl border-border bg-background resize-none"
          />
        </div>

        {/* Mood + Rating */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How do you feel?</Label>
            <Select value={formData.mood} onValueChange={(value) => setFormData((prev) => ({ ...prev, mood: value }))}>
              <SelectTrigger className="rounded-xl border-border bg-background">
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Session Rating</Label>
            <div className="flex items-center h-10">
              <StarPicker value={formData.rating} onChange={(v) => setFormData((prev) => ({ ...prev, rating: v }))} />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label htmlFor="tags" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tags <span className="normal-case font-normal">(comma-separated)</span></Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
            placeholder="react, concepts, challenging"
            className="rounded-xl border-border bg-background"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            {loading ? 'Saving…' : 'Save Log'}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-border text-foreground font-semibold text-sm hover:bg-muted active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
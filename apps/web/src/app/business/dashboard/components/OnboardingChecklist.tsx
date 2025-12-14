'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Check,
  Circle,
  Image,
  Clock,
  FileText,
  Shield,
  Sparkles,
  X,
  ChevronRight,
  Users,
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  completed: boolean;
  action?: () => void;
  link?: string;
}

interface OnboardingChecklistProps {
  businessId: string;
  hasDescription: boolean;
  hasPhotos: boolean;
  hasHours: boolean;
  hasServices: boolean;
  isVerified: boolean;
  onDismiss?: () => void;
  onSetTab?: (tab: string) => void;
}

export function OnboardingChecklist({
  businessId,
  hasDescription,
  hasPhotos,
  hasHours,
  hasServices,
  isVerified,
  onDismiss,
  onSetTab,
}: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  // Check if dismissed in localStorage
  useEffect(() => {
    const isDismissed = localStorage.getItem(`onboarding-dismissed-${businessId}`);
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, [businessId]);

  const handleDismiss = () => {
    localStorage.setItem(`onboarding-dismissed-${businessId}`, 'true');
    setDismissed(true);
    onDismiss?.();
  };

  const checklistItems: ChecklistItem[] = [
    {
      id: 'description',
      title: 'Add business description',
      description: 'Tell customers what makes your business special',
      icon: FileText,
      completed: hasDescription,
      action: () => onSetTab?.('settings'),
    },
    {
      id: 'photos',
      title: 'Upload photos',
      description: 'Showcase your work with high-quality images',
      icon: Image,
      completed: hasPhotos,
      action: () => onSetTab?.('photos'),
    },
    {
      id: 'hours',
      title: 'Set business hours',
      description: 'Let customers know when you\'re open',
      icon: Clock,
      completed: hasHours,
      action: () => onSetTab?.('hours'),
    },
    {
      id: 'services',
      title: 'Add your services',
      description: 'List what you offer with prices',
      icon: Users,
      completed: hasServices,
      action: () => onSetTab?.('services'),
    },
    {
      id: 'verification',
      title: 'Request verification',
      description: 'Get the verified badge to build trust',
      icon: Shield,
      completed: isVerified,
      link: `/business/dashboard?tab=verification`,
    },
  ];

  const completedCount = checklistItems.filter(item => item.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);
  const allComplete = completedCount === totalCount;

  // Don't show if dismissed or all complete
  if (dismissed || allComplete) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Complete Your Profile</h3>
            <p className="text-sm text-neutral-400">
              {completedCount} of {totalCount} tasks complete
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          title="Dismiss checklist"
        >
          <X className="h-5 w-5 text-neutral-500" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          {progressPercent}% complete — {allComplete ? 'All done!' : 'Keep going!'}
        </p>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklistItems.map((item) => {
          const ItemIcon = item.icon;
          const content = (
            <div
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                item.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30 cursor-pointer'
              }`}
              onClick={() => !item.completed && item.action?.()}
            >
              {/* Status Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? 'bg-green-500/20'
                    : 'bg-white/10'
                }`}
              >
                {item.completed ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 text-neutral-500" />
                )}
              </div>

              {/* Icon */}
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.completed
                    ? 'bg-green-500/20'
                    : 'bg-purple-500/20'
                }`}
              >
                <ItemIcon
                  className={`h-5 w-5 ${
                    item.completed ? 'text-green-400' : 'text-purple-400'
                  }`}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-medium ${
                    item.completed
                      ? 'text-green-400 line-through'
                      : 'text-white'
                  }`}
                >
                  {item.title}
                </h4>
                <p className="text-sm text-neutral-500 truncate">
                  {item.description}
                </p>
              </div>

              {/* Action Arrow */}
              {!item.completed && (
                <ChevronRight className="h-5 w-5 text-neutral-500 flex-shrink-0" />
              )}
            </div>
          );

          // Wrap in Link if has link property
          if (item.link && !item.completed) {
            return (
              <Link key={item.id} href={item.link}>
                {content}
              </Link>
            );
          }

          return <div key={item.id}>{content}</div>;
        })}
      </div>

      {/* Tip */}
      <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
        <p className="text-sm text-neutral-400">
          <span className="text-purple-400 font-medium">💡 Tip:</span> Businesses with complete
          profiles get <span className="text-white">3x more views</span> and appear higher in
          search results.
        </p>
      </div>
    </div>
  );
}

export default OnboardingChecklist;

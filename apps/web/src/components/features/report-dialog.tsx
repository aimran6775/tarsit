'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Flag, Loader2 } from 'lucide-react';
import { useState } from 'react';

export type ReportTarget = 'BUSINESS' | 'REVIEW' | 'USER' | 'MESSAGE';

export type ReportReason =
  | 'SPAM'
  | 'INAPPROPRIATE'
  | 'FAKE'
  | 'HARASSMENT'
  | 'MISLEADING'
  | 'COPYRIGHT'
  | 'SCAM'
  | 'OTHER';

interface ReportDialogProps {
  targetType: ReportTarget;
  targetId: string;
  targetName?: string;
  trigger?: React.ReactNode;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  { value: 'SPAM', label: 'Spam', description: 'Unwanted promotional content or advertisements' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate Content', description: 'Offensive, vulgar, or explicit content' },
  { value: 'FAKE', label: 'Fake or False', description: 'Misleading information or fake account' },
  { value: 'HARASSMENT', label: 'Harassment', description: 'Bullying, threats, or targeted abuse' },
  { value: 'MISLEADING', label: 'Misleading', description: 'Deceptive claims or false advertising' },
  { value: 'COPYRIGHT', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
  { value: 'SCAM', label: 'Scam', description: 'Fraudulent activity or attempted scam' },
  { value: 'OTHER', label: 'Other', description: 'Something else not listed above' },
];

export function ReportDialog({ targetType, targetId, targetName, trigger }: ReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: 'Select a reason',
        description: 'Please select a reason for your report.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          targetType,
          targetId,
          reason,
          description: description.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit report');
      }

      toast({
        title: 'Report submitted',
        description: 'Thank you for helping keep our community safe. We will review your report shortly.',
      });

      setOpen(false);
      setReason(null);
      setDescription('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetLabel = () => {
    switch (targetType) {
      case 'BUSINESS':
        return 'business';
      case 'REVIEW':
        return 'review';
      case 'USER':
        return 'user';
      case 'MESSAGE':
        return 'message';
      default:
        return 'content';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="h-4 w-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Report {getTargetLabel()}
          </DialogTitle>
          <DialogDescription>
            {targetName ? (
              <>Report &ldquo;{targetName}&rdquo; for violating our community guidelines.</>
            ) : (
              <>Help us keep our community safe by reporting inappropriate content.</>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Why are you reporting this?</Label>
            <div className="grid gap-2">
              {REPORT_REASONS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReason(r.value)}
                  className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                    reason === r.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="font-medium text-sm">{r.label}</span>
                  <span className="text-xs text-muted-foreground">{r.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help us understand the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

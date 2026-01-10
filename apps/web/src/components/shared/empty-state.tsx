'use client';

import { ReactNode } from 'react';
import { Search, Frown, AlertCircle, FileQuestion, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

type IconType = 'search' | 'error' | 'not-found' | 'empty' | 'frown';

interface EmptyStateProps {
  icon?: ReactNode | IconType;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const iconMap: Record<IconType, ReactNode> = {
  search: <Search className="h-10 w-10 text-muted-foreground" />,
  error: <AlertCircle className="h-10 w-10 text-destructive" />,
  'not-found': <FileQuestion className="h-10 w-10 text-muted-foreground" />,
  empty: <Inbox className="h-10 w-10 text-muted-foreground" />,
  frown: <Frown className="h-10 w-10 text-muted-foreground" />,
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return iconMap.search;
    if (typeof icon === 'string' && icon in iconMap) {
      return iconMap[icon as IconType];
    }
    return icon;
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="h-20 w-20 rounded-full glass flex items-center justify-center mb-4">
        {renderIcon()}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-md mb-6">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoResults() {
  return (
    <EmptyState
      icon={<Frown className="h-10 w-10 text-muted-foreground" />}
      title="No results found"
      description="Try adjusting your search or filters to find what you're looking for."
    />
  );
}

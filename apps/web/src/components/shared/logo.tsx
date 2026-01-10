import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  href?: string;
}

export function Logo({ size = 'md', className, href = '/' }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const logo = (
    <span 
      className={cn(
        'font-semibold tracking-tight text-foreground',
        sizeClasses[size],
        className
      )}
    >
      tarsit
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {logo}
      </Link>
    );
  }

  return logo;
}

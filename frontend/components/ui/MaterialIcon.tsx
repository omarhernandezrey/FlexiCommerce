import { cn } from '@/lib/cn';

interface MaterialIconProps {
  name: string;
  filled?: boolean;
  className?: string;
}

export function MaterialIcon({ name, filled, className }: MaterialIconProps) {
  return (
    <span
      className={cn('material-symbols-outlined', filled && 'fill-1', className)}
    >
      {name}
    </span>
  );
}

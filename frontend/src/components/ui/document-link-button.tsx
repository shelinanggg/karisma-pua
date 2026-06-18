import { Link2 } from 'lucide-react';

import { cn } from './utils';

type DocumentLinkButtonProps = {
  href?: string | null;
  title?: string;
  label?: string;
  className?: string;
};

export function DocumentLinkButton({
  href,
  title = 'Buka dokumen',
  label,
  className,
}: DocumentLinkButtonProps) {
  const styles = cn(
    'inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-card px-3 text-sm font-medium text-gray-700 shadow-sm transition-all',
    'hover:border-gray-300 hover:bg-gray-50 hover:text-gray-950 hover:shadow-md',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20',
    !label && 'w-12 min-w-12 px-0',
    !href && 'cursor-not-allowed opacity-40 hover:border-gray-200 hover:bg-card hover:text-gray-700 hover:shadow-sm',
    className,
  );

  if (!href) {
    return (
      <span className={styles} title={`${title} belum tersedia`} aria-disabled="true">
        <Link2 className="size-3" />
        {label && <span>{label}</span>}
      </span>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={title} className={styles}>
      <Link2 className="size-3" />
      {label && <span>{label}</span>}
    </a>
  );
}

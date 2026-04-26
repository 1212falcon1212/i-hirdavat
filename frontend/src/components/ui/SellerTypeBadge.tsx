'use client';

import { cn } from '@/lib/utils';

interface SellerTypeBadgeProps {
  role: 'seller' | 'company' | 'pharmacy' | 'pharmacist' | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Seller "S" Icon — letter S in a rounded industrial square
const SellerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="2" fill="currentColor" />
    <path
      d="M15.5 8.5c-.4-1.2-1.7-2-3.4-2-1.8 0-3.1.9-3.1 2.3 0 1.1.8 1.8 2.4 2.1l1.9.3c.9.2 1.3.5 1.3 1 0 .7-.7 1.1-1.8 1.1-1.3 0-2.1-.4-2.4-1.3H8c.3 1.7 1.8 2.7 4.1 2.7 2.3 0 3.7-1 3.7-2.6 0-1.1-.7-1.8-2.3-2.1l-1.8-.3c-1-.2-1.5-.5-1.5-1 0-.7.6-1.1 1.6-1.1 1 0 1.7.4 1.9 1.1h1.8Z"
      fill="white"
    />
  </svg>
);

// Company Building Icon — kept for multi-location wholesalers
const CompanyIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path d="M3 21V7L12 3L21 7V21H3Z" fill="currentColor" />
    <rect x="6" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="10.5" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="15" y="9" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="6" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="10.5" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="15" y="13" width="3" height="2.5" rx="0.5" fill="white" />
    <rect x="9.5" y="17" width="5" height="4" rx="0.5" fill="white" />
  </svg>
);

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const labelSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function SellerTypeBadge({
  role,
  size = 'md',
  showLabel = false,
  className,
}: SellerTypeBadgeProps) {
  const isSeller = role === 'seller' || role === 'pharmacy' || role === 'pharmacist';
  const isCompany = role === 'company';

  if (!isSeller && !isCompany) {
    return null;
  }

  const Icon = isCompany ? CompanyIcon : SellerIcon;
  const label = isCompany ? 'Firma' : 'Bayi';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5',
        className
      )}
      title={label}
    >
      <Icon className={cn(sizeClasses[size], 'text-neutral-800')} />
      {showLabel && (
        <span className={cn(labelSizeClasses[size], 'text-neutral-600 font-medium')}>
          {label}
        </span>
      )}
    </div>
  );
}

export { SellerIcon, CompanyIcon };
// Legacy alias — some callers imported `PharmacyIcon` by name.
export { SellerIcon as PharmacyIcon };

'use client';

// Grid layout wrapper — now delegates to ProductCard with variant="default".
// Kept as a separate export to preserve import sites; identical visual output.

import React from 'react';
import { ProductCard, type ProductCardData } from './ProductCard';

interface GridProductCardProps {
  product: ProductCardData & { highest_price?: number };
  className?: string;
}

export const GridProductCard = React.memo(function GridProductCard({
  product,
  className,
}: GridProductCardProps) {
  return <ProductCard product={product} className={className} variant="default" />;
});

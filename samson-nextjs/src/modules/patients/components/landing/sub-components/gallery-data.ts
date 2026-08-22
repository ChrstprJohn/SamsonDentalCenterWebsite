export const portfolioItems = [
  { id: 1, type: 'image', tags: ['Dental implants', 'Veneers'], title: 'Precision Implant & Veneer Restoration' },
  { id: 2, type: 'image', tags: ['Veneers'], title: 'Aesthetic Porcelain Veneers Transformation' },
  { id: 3, type: 'image', tags: ['Veneers'], title: 'Custom Shaded Anterior Veneers' },
  { id: 4, type: 'image', tags: ['ALL-ON-X'], title: 'Full Arch ALL-ON-X Rejuvenation' },
  { id: 5, type: 'image', tags: ['ALL-ON-X'], title: 'Comprehensive ALL-ON-X Rehabilitation' },
  { id: 6, type: 'image', tags: ['Endodontics', 'Veneers'], title: 'Integrated Endodontic & Veneer Restoration' },
  { id: 7, type: 'image', tags: ['Veneers'], title: 'Full Smile Veneer Perfecting' },
  { id: 8, type: 'image', tags: ['Veneers', 'Therapy'], title: 'Combined Veneers & Functional Therapy' },
  { id: 9, type: 'image', tags: ['Endodontics', 'Dental implants'], title: 'Advanced Implantology & Endodontics' },
  { id: 10, type: 'image', tags: ['Professional hygiene', 'Veneers'], title: 'Professional Hygiene & Veneer Finish' },
] as const;

export type PortfolioItem = {
  id: number;
  src?: string;
  type: 'image';
  tags: readonly string[];
  title: string;
};

const cleanedAssetSrcs: Record<number, string> = {
  1: '/assets/Assets (1).jpg',
  2: '/assets/Assets (2)-combined.jpg',
  4: '/new-assets/new-assets (1).jpg',
  8: '/new-assets/new-assets (8).jpg',
  9: '/assets/Assets (9)-combined.jpg',
  10: '/new-assets/new-asset (10).png',
};

const assetSrcs = [2, 4, 6, 7, 8, 9, 10, 12, 11, 1, 14]
  .map((n) => (n === 2 ? '/assets/Assets (2)-combined.jpg' : cleanedAssetSrcs[n] ?? `/assets/Assets (${n}).jpg`));

export const repeatedPortfolioItems = Array.from({ length: 50 }, (_, index) => {
  const baseItem = portfolioItems[index % portfolioItems.length];
  return { ...baseItem, id: index + 1, src: assetSrcs[index % assetSrcs.length] };
});

// 15 visible slots (18 minus dropped 10, 15, 17); src assigned by visible order so all 13 assets show.
export const galleryItems: PortfolioItem[] = (() => {
  const order = Array.from({ length: 18 }, (_, i) => i).filter((i) => ![10, 15, 17].includes(i));
  const items = order.map((idx, n) => ({
    ...repeatedPortfolioItems[idx],
    id: idx + 1,
    src:
      n === order.length - 3
        ? '/assets/Assets (14).jpg'
        : n === order.length - 2
          ? '/new-assets/new-assets (6).jpg'
          : n === order.length - 1
            ? '/new-assets/new-assets (7).jpg'
            : assetSrcs[n % assetSrcs.length],
  }));
  return [
    ...items,
    ...[1, 2, 4, 3, 7, 9].map((n, i) => ({
      id: items.length + i + 1,
      type: 'image' as const,
      tags: [i % 2 === 0 ? 'Veneers' : 'Dental implants', i % 2 === 0 ? 'ALL-ON-X' : 'Endodontics'],
      title: 'Additional Gallery Case',
      src: `/img/Img (${n}).jpg`,
    })),
  ];
})();

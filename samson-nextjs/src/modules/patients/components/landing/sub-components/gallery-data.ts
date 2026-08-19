export const portfolioItems = [
  { id: 1, type: 'video', tags: ['Dental implants', 'Veneers'], title: 'Precision Implant & Veneer Restoration' },
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

export const repeatedPortfolioItems = Array.from({ length: 50 }, (_, index) => {
  const baseItem = portfolioItems[index % portfolioItems.length];
  return { ...baseItem, id: index + 1 };
});

export type PortfolioItem = (typeof repeatedPortfolioItems)[number] & { src?: string };

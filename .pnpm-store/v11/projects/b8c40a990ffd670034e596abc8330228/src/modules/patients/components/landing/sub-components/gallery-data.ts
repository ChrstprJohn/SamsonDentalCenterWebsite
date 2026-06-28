export const portfolioItems = [
  { id: 1, type: 'video', src: 'https://lavadental.lv/cms/api/media/file/v1.webm', tags: ['Dental implants', 'Veneers'], title: 'Precision Implant & Veneer Restoration' },
  { id: 2, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/2p%C4%93c-7-960x635.avif', tags: ['Veneers'], title: 'Aesthetic Porcelain Veneers Transformation' },
  { id: 3, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-1-960x635.avif', tags: ['Veneers'], title: 'Custom Shaded Anterior Veneers' },
  { id: 4, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-2-960x635.avif', tags: ['ALL-ON-X'], title: 'Full Arch ALL-ON-X Rejuvenation' },
  { id: 5, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-3-960x635.avif', tags: ['ALL-ON-X'], title: 'Comprehensive ALL-ON-X Rehabilitation' },
  { id: 6, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/2p%C4%93c-1-960x635.avif', tags: ['Endodontics', 'Veneers'], title: 'Integrated Endodontic & Veneer Restoration' },
  { id: 7, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-2-960x635.avif', tags: ['Veneers'], title: 'Full Smile Veneer Perfecting' },
  { id: 8, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/3p%C4%93c-3-960x635.avif', tags: ['Veneers', 'Therapy'], title: 'Combined Veneers & Functional Therapy' },
  { id: 9, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/4p%C4%93c-960x635.avif', tags: ['Endodontics', 'Dental implants'], title: 'Advanced Implantology & Endodontics' },
  { id: 10, type: 'image', src: 'https://lavadental.lv/cms/api/media/file/1p%C4%93c-8-960x635.avif', tags: ['Professional hygiene', 'Veneers'], title: 'Professional Hygiene & Veneer Finish' },
] as const;

export const repeatedPortfolioItems = Array.from({ length: 50 }, (_, index) => {
  const baseItem = portfolioItems[index % portfolioItems.length];
  return { ...baseItem, id: index + 1 };
});

export type PortfolioItem = (typeof repeatedPortfolioItems)[number];

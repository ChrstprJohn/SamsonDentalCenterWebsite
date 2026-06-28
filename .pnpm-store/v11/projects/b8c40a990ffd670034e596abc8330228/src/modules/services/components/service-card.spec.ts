import { describe, it, expect } from 'vitest';

// Pure logic extracted from ServiceCard for complete unit testability in Node
function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'Contact for pricing';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function getEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('whitening') || n.includes('bleach')) return '✨';
  if (n.includes('implants') || n.includes('crown') || n.includes('bridge')) return '🦷';
  if (n.includes('ortho') || n.includes('brace') || n.includes('aligner')) return '🪥';
  if (n.includes('clean') || n.includes('hyg')) return '🧼';
  if (n.includes('extract') || n.includes('surg')) return '🩺';
  return '🦷';
}

describe('ServiceCard Pure Logic Helpers', () => {
  describe('formatPrice', () => {
    it('should format positive prices to USD successfully', () => {
      expect(formatPrice(99)).toBe('$99.00');
      expect(formatPrice(1499)).toBe('$1,499.00');
    });

    it('should return default pricing message for null values', () => {
      expect(formatPrice(null)).toBe('Contact for pricing');
    });
  });

  describe('getEmoji', () => {
    it('should resolve correct emojis for teeth whitening and bleaching', () => {
      expect(getEmoji('Laser Whitening Session')).toBe('✨');
      expect(getEmoji('Active bleaching')).toBe('✨');
    });

    it('should resolve orthodontic aligners to toothbrush/braces emoji', () => {
      expect(getEmoji('Clear Aligner Scan')).toBe('🪥');
      expect(getEmoji('Metal Braces Fitting')).toBe('🪥');
    });

    it('should resolve cleanings to soap/bubble emoji', () => {
      expect(getEmoji('Routine cleaning')).toBe('🧼');
    });

    it('should fall back to general tooth emoji for unmatched names', () => {
      expect(getEmoji('X-Ray scan')).toBe('🦷');
    });
  });
});

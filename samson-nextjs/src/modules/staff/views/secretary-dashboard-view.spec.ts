import { describe, it, expect } from 'vitest';

// Pure logic helper extracted from SecretaryDashboardView for isolated node unit testing
function calculateFinalPrice(basePrice: number, discount: number): number {
  const final = basePrice - (basePrice * (discount / 100));
  return Math.max(0, parseFloat(final.toFixed(2)));
}

describe('SecretaryDashboardView Dynamic Invoicing calculations', () => {
  it('should apply discount percentages correctly to base prices', () => {
    const result = calculateFinalPrice(100, 10); // 10% off $100
    expect(result).toBe(90);
  });

  it('should return base price when discount is zero percent', () => {
    const result = calculateFinalPrice(450, 0);
    expect(result).toBe(450);
  });

  it('should format decimals to two decimal places', () => {
    const result = calculateFinalPrice(299, 15); // 15% off $299 => 299 - 44.85 = 254.15
    expect(result).toBe(254.15);
  });

  it('should cap calculations to zero if discount exceeds 100 percent', () => {
    const result = calculateFinalPrice(150, 120);
    expect(result).toBe(0);
  });
});

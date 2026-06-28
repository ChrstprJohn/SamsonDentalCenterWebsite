// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServicesView } from './use-services-view';
import type { Service } from '../../types';

const mockServices: Service[] = [
  { id: '1', name: 'Teeth Cleaning', description: 'Clean teeth', durationMinutes: 30, price: 100, serviceType: 'GENERAL', isActive: true, status: 'ACTIVE' },
  { id: '2', name: 'Orthodontics', description: 'Braces', durationMinutes: 60, price: 200, serviceType: 'SPECIALIZED', isActive: true, status: 'ACTIVE' },
  { id: '3', name: 'Whitening', description: 'Shiny teeth', durationMinutes: 45, price: 150, serviceType: 'GENERAL', isActive: false, status: 'HIDDEN' },
];

describe('useServicesView', () => {
  it('should filter active services by default', () => {
    const { result } = renderHook(() => useServicesView(mockServices));
    expect(result.current.filteredServices.length).toBe(2);
    expect(result.current.filteredServices.map(s => s.id)).toContain('1');
    expect(result.current.filteredServices.map(s => s.id)).toContain('2');
  });

  it('should filter by search query', () => {
    const { result } = renderHook(() => useServicesView(mockServices));
    act(() => {
      result.current.setSearchQuery('Ortho');
    });
    expect(result.current.filteredServices.length).toBe(1);
    expect(result.current.filteredServices[0].id).toBe('2');
  });

  it('should filter by tag (serviceType)', () => {
    const { result } = renderHook(() => useServicesView(mockServices));
    act(() => {
      result.current.setTagFilter('SPECIALIZED');
    });
    expect(result.current.filteredServices.length).toBe(1);
    expect(result.current.filteredServices[0].id).toBe('2');
  });
});

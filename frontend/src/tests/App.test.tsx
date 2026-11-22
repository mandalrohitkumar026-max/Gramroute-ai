import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

describe('GramRoute AI Frontend Phase 1 Foundation', () => {
  it('renders GramRoute AI branding and primary navigation', () => {
    render(<App />);
    expect(screen.getAllByText(/GramRoute/i).length).toBeGreaterThan(0);
  });

  it('renders landing page hero headline', () => {
    render(<App />);
    expect(screen.getByText(/Smarter Freight\./i)).toBeInTheDocument();
    expect(screen.getByText(/Fuller Vehicles\./i)).toBeInTheDocument();
  });

  it('renders network visualizer simulation mode buttons', () => {
    render(<App />);
    expect(screen.getByText(/GramRoute AI \(Optimized\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Traditional \(Fragmented\)/i)).toBeInTheDocument();
  });

  it('renders public navigation solutions and impact telemetry', () => {
    render(<App />);
    expect(screen.getAllByText(/Solutions/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/How It Works/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Features/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/FAQ/i).length).toBeGreaterThan(0);
  });
});

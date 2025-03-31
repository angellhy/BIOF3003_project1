import React from 'react';

interface MetricsCardProps {
  title: string;
  value: number | string | { bpm?: number; sdnn?: number }; // Support for structured types
  unit?: string;
  confidence?: number; // Optional confidence for cases where it's not needed
  color?: 'cyan' | 'purple' | 'pink';
}

export default function MetricsCard({
  title,
  value,
  unit,
  confidence,
  color = 'cyan',
}: MetricsCardProps) {
  return (
    <div
      className="bg-white p-4 rounded-lg shadow flex-1 min-w-[150px] border-2 border-green-200" // Light green border
      style={{ color: '#15803d' }} // Dark green text color
    >
      <p className="text-green-700">{title}</p> {/* Dark green title */}
      <h2 className="text-2xl font-bold text-green-700">
        {typeof value === 'number' && value > 0
          ? `${value} ${unit || ''}` // Display numeric values with optional units
          : typeof value === 'string'
          ? `${value}`
          : typeof value === 'object' && value !== null
          ? value.bpm !== undefined
            ? `${value.bpm} BPM` // Handle HeartRateResult
            : value.sdnn !== undefined
            ? isNaN(value.sdnn)
              ? '--' // Handle NaN for HRV
              : `${value.sdnn} ms` // Handle HRVResult
            : '--'
          : '--'}{' '}
        {/* Fallback for undefined or invalid values */}
      </h2>
      {confidence !== undefined && (
        <p className="text-sm text-green-600">
          Confidence: {confidence.toFixed(1)}%
        </p>
      )}
    </div>
  );
}
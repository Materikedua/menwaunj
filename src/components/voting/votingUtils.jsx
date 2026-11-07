import React, { useState, useEffect } from 'react';

export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num || 0);
}

/** Komponen Odometer / Count-Up Angka Suara */
export function AnimatedVoteCounter({ value }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = Number(value) || 0;
    if (start === end) return undefined;
    const diff = end - start;
    const steps = 16;
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep += 1;
      if (currentStep >= steps) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.round(start + (diff * currentStep) / steps));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue.toLocaleString('id-ID')}</span>;
}


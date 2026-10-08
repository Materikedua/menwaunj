import React, { useState, useEffect } from 'react';
import { fotoUrl, initials } from '../lib/foto';

/** Foto anggota dari public/struktur/<nama-slug>.svg; bila belum ada, tampil inisial. */
export const PersonPhoto = ({ name, fallback }) => {
  const [bad, setBad] = useState(false);
  useEffect(() => setBad(false), [name]);
  if (bad) return <span aria-label={name}>{fallback || initials(name).toUpperCase()}</span>;
  return (
    <img
      src={fotoUrl(name)} alt={`Foto ${name}`} loading="lazy" decoding="async" draggable={false}
      onError={() => setBad(true)} className="h-full w-full object-cover"
    />
  );
};

export default PersonPhoto;

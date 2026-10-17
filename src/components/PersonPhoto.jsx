import React from 'react';

/**
 * Avatar ILUSTRASI sementara, bukan foto resmi/representasi identitas atau jenis kelamin.
 * Mapping visual nama dapat ditinjau ulang pengurus ketika foto resmi tersedia.
 */
const femaleNames = new Set([
  'agustina','alea','anggie','aulia','ghibthah','gisela','hermina','hilmi',
  'julia','khansa','laras','lia','lisa','margaretha','nadia','natalia',
  'paskalina','revalia','riza','santi','serlina','siti','theofila','tiara','wanda'
]);

export const PersonPhoto = ({name}) => {
  const first = String(name || '').trim().split(/\s+/)[0].toLowerCase();
  const useFemaleArt = femaleNames.has(first);
  const src = useFemaleArt ? '/mascot/chibi-menwa-girl.webp' : '/mascot/chibi-menwa-boy.webp';
  return <img src={src} alt={`Ilustrasi maskot profil ${name}; belum merupakan foto resmi`} title="Avatar ilustrasi sementara" className="h-full w-full object-contain bg-gradient-to-br from-[#dff0ea] to-[#f4f0df] p-1" loading="lazy" decoding="async" draggable={false} />;
};

export default PersonPhoto;

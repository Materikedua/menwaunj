import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { KOP_SURAT_STANDARD_MENWA_UNJ } from '../lib/espriVerification';
import { KopSuratStandardConfig } from '../types/espriVerification';

export interface KopSuratMenwaUnjProps {
  config?: Partial<KopSuratStandardConfig>;
  showMotto?: boolean;
  /** Opsional: URL verifikasi QR (`https://menwaunj.or.id/verifikasi?hash=...`) jika ingin dipakai bersama header/footer surat web */
  verificationUrl?: string;
}

/**
 * Komponen Kop Surat Standar Resmi E-Spri Menwa UNJ (2026).
 * Gunakan komponen ini pada seluruh fitur penerbitan surat di website utama `menwaunj.or.id`
 * (E-Dispensasi, AdminU, Surat Tugas, Surat Keterangan) agar format kop, font Arial,
 * proporsi logo, dan garis ganda resmi 100% seragam dengan E-Spri.
 */
export const KopSuratMenwaUnj: React.FC<KopSuratMenwaUnjProps> = ({
  config,
  showMotto = false,
}) => {
  const c = { ...KOP_SURAT_STANDARD_MENWA_UNJ, ...config };

  return (
    <header
      className="w-full text-black select-none"
      style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
      data-testid="kop-surat-menwa-unj-standard"
    >
      <div className="flex items-center justify-between min-h-[96px]">
        {/* Logo Kiri: Universitas Negeri Jakarta */}
        <div
          className="shrink-0 flex items-center justify-start"
          style={{ width: '88px', height: '94px' }}
        >
          <img
            src={c.logoUnjPath}
            alt="Logo Universitas Negeri Jakarta"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>

        {/* 5 Baris Teks Kop Surat Resmi (Arial 13.5pt & 9.5pt) */}
        <div className="flex-1 text-center px-1 leading-[1.18]">
          <div
            style={{ fontSize: '13.5pt' }}
            className="font-bold uppercase tracking-normal whitespace-nowrap text-black"
          >
            {c.baris1}
          </div>
          <div
            style={{ fontSize: '13.5pt' }}
            className="font-bold uppercase tracking-normal whitespace-nowrap text-black"
          >
            {c.baris2}
          </div>
          <div
            style={{ fontSize: '9.5pt' }}
            className="font-normal text-black mt-0.5 whitespace-nowrap"
          >
            {c.alamat}
          </div>
          <div
            style={{ fontSize: '9.5pt' }}
            className="font-normal text-black whitespace-nowrap"
          >
            {c.kontak}
          </div>
          <div
            style={{ fontSize: '9.5pt' }}
            className="font-normal text-black whitespace-nowrap"
          >
            Laman:{' '}
            <a
              href={c.lamanUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#0000ee] underline"
            >
              {c.lamanLabel}
            </a>
          </div>
        </div>

        {/* Logo Kanan: Komando Resimen Mahasiswa Jayakarta */}
        <div
          className="shrink-0 flex items-center justify-end"
          style={{ width: '96px', height: '94px' }}
        >
          <img
            src={c.logoMenwaPath}
            alt="Logo Menwa Jayakarta Satuan UNJ"
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      {/* Pembatas Kop Garis Ganda Resmi: Tipis (0.75pt) di Atas + Tebal (2.75pt) di Bawah */}
      <div className="w-full mt-1 mb-1.5" aria-hidden="true">
        <div style={{ borderTop: '0.75pt solid #000000', marginBottom: '2pt' }} />
        <div style={{ borderTop: '2.75pt solid #000000' }} />
      </div>

      {/* Opsional Motto Korps di bawah garis pembatas */}
      {showMotto && (
        <div className="my-1 text-left leading-[1.12]">
          <div
            style={{ fontSize: '11.5pt' }}
            className="font-bold italic uppercase tracking-wide"
          >
            {c.mottoJudul}
          </div>
          <div style={{ fontSize: '10pt' }} className="italic">
            {c.mottoSubJudul}
          </div>
        </div>
      )}
    </header>
  );
};

/**
 * Komponen QR Code Verifikasi standar E-Spri untuk diletakkan di samping tanda tangan
 * Komandan / pejabat penandatangan pada surat terbitan website utama menwaunj.or.id.
 */
export const LetterVerificationQrBadge: React.FC<{
  verificationUrl: string;
  sizePx?: number;
}> = ({ verificationUrl, sizePx = 68 }) => {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(verificationUrl, {
      width: 240,
      margin: 0,
      color: { dark: '#000000', light: '#00000000' },
      errorCorrectionLevel: 'L',
    })
      .then((url) => {
        if (active) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Gagal membuat QR verifikasi surat:', err);
      });

    return () => {
      active = false;
    };
  }, [verificationUrl]);

  if (!dataUrl) return null;

  return (
    <img
      src={dataUrl}
      alt="Kode QR Verifikasi Menwa UNJ"
      title={`Verifikasi resmi: ${verificationUrl}`}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      className="object-contain inline-block"
    />
  );
};

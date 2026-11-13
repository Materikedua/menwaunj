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
      <table
        id="kop-surat-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          borderSpacing: 0,
          margin: 0,
          padding: 0,
        }}
      >
        <tbody>
          <tr>
            {/* Logo Kiri: Universitas Negeri Jakarta (Proposional Standar Resmi) */}
            <td
              style={{
                width: '68px',
                verticalAlign: 'middle',
                textAlign: 'left',
                padding: 0,
              }}
            >
              <img
                src={c.logoUnjPath}
                alt="Logo Universitas Negeri Jakarta"
                referrerPolicy="no-referrer"
                width={62}
                height={66}
                style={{
                  width: '62px',
                  height: '66px',
                  maxWidth: '62px',
                  maxHeight: '66px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </td>

            {/* 5 Baris Teks Kop Surat Resmi (Arial 12.5pt & 8.5pt) */}
            <td
              style={{
                verticalAlign: 'middle',
                textAlign: 'center',
                padding: '0 4px',
                lineHeight: 1.18,
              }}
            >
              <div
                style={{ fontSize: '12.5pt', fontWeight: 'bold' }}
                className="uppercase tracking-normal whitespace-nowrap text-black font-sans"
              >
                {c.baris1}
              </div>
              <div
                style={{ fontSize: '12.5pt', fontWeight: 'bold' }}
                className="uppercase tracking-normal whitespace-nowrap text-black font-sans"
              >
                {c.baris2}
              </div>
              <div
                style={{ fontSize: '8.5pt' }}
                className="font-normal text-black mt-0.5 whitespace-nowrap font-sans"
              >
                {c.alamat}
              </div>
              <div
                style={{ fontSize: '8.5pt' }}
                className="font-normal text-black whitespace-nowrap font-sans"
              >
                {c.kontak}
              </div>
              <div
                style={{ fontSize: '8.5pt' }}
                className="font-normal text-black whitespace-nowrap font-sans"
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
            </td>

            {/* Logo Kanan: Komando Resimen Mahasiswa Jayakarta */}
            <td
              style={{
                width: '72px',
                verticalAlign: 'middle',
                textAlign: 'right',
                padding: 0,
              }}
            >
              <img
                src={c.logoMenwaPath}
                alt="Logo Menwa Jayakarta Satuan UNJ"
                referrerPolicy="no-referrer"
                width={68}
                height={66}
                style={{
                  width: '68px',
                  height: '66px',
                  maxWidth: '68px',
                  maxHeight: '66px',
                  objectFit: 'contain',
                  display: 'block',
                  marginLeft: 'auto',
                }}
              />
            </td>
          </tr>
        </tbody>
      </table>

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

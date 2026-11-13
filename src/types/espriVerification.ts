export type PublicVerificationStatus =
  | 'SAH'
  | 'TERVERIFIKASI'
  | 'MENUNGGU_TTD'
  | 'DICABUT'
  | 'KEDALUWARSA';

export type PublicVerificationSource = 'E-SPRI' | 'ADMINU' | 'EDISPENSASI';

export interface PublicVerificationRecord {
  hash: string;
  letterNumber: string;
  letterType: string;
  subject: string;
  recipient: string;
  issuedDate: string;
  signerName: string;
  signerTitle: string;
  status: PublicVerificationStatus;
  source: PublicVerificationSource;
  createdAt: string;
  updatedAt: string;
  agendaNumber?: string;
  issuingUnit?: string;
  validUntil?: string;
  signerNia?: string;
  statusReason?: string;
  documentSha256?: string;
  verificationUrl?: string;
}

export interface ParsedVerificationQuery {
  hash: string;
  agendaOrNomor: string;
  docId: string;
  matchedParam:
    | 'hash'
    | 'path'
    | 'no'
    | 'nomor'
    | 'doc'
    | 'surat'
    | 'id'
    | 'kode'
    | 'cert'
    | 'verify'
    | 'none';
}

export interface KopSuratStandardConfig {
  baris1: string;
  baris2: string;
  alamat: string;
  kontak: string;
  lamanLabel: string;
  lamanUrl: string;
  mottoJudul: string;
  mottoSubJudul: string;
  logoUnjPath: string;
  logoMenwaPath: string;
}

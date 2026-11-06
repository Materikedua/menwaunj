/**
 * Helper pembuka dan pengunduh berkas PDF yang kompatibel di semua browser.
 * Mengubah data URL base64 menjadi Object URL (Blob) agar tidak diblokir browser modern.
 */
export function openOrDownloadPdf(pdfTarget, fileName = 'dokumen-surat.pdf') {
  if (!pdfTarget) return;
  if (pdfTarget.startsWith('data:')) {
    try {
      const parts = pdfTarget.split(',');
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const mimeMatch = parts[0].match(/:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'application/pdf';
      const blob = new Blob([byteArray], { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);
      const newTab = window.open(blobUrl, '_blank', 'noopener,noreferrer');
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      return;
    } catch (e) {
      console.warn('Blob PDF conversion error:', e);
    }
  }
  window.open(pdfTarget, '_blank', 'noopener,noreferrer');
}

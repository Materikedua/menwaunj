import { saveOfficialPortal, compressImageFile } from '../../firebase.js';
import { validateImageFile } from './participantUtils.js';

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function useParticipantRosterHandlers({
  canEdit,
  showToast,
  profileForm,
  setProfileForm,
  profileErrors,
  setProfileErrors,
  setSavingProfile,
  portalData,
  setPortalData,
  activeSlug,
  setDocUploadError,
  setUploadingDocId,
  pasukanForm,
  setPasukanForm,
  setPasukanErrors,
  editingPasukanId,
  setEditingPasukanId,
  setShowPasukanForm,
  officialForm,
  setOfficialForm,
  setOfficialErrors,
  editingOfficialId,
  setEditingOfficialId,
  setShowOfficialForm,
}) {
  const handleSchoolLogoChange = async (e) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses edit dibatasi.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: check.error }));
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setProfileForm((prev) => ({
        ...prev,
        logoDataUrl: dataUrl,
        logoFileName: file.name,
        logoSizeKb: Math.round(file.size / 1024),
      }));
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: '' }));
    } catch (err) {
      setProfileErrors((prev) => ({ ...prev, logoDataUrl: err.message }));
    }
  };

  const handleSaveSchoolProfile = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses edit profil dibatasi.');
      return;
    }
    const errors = {};
    if (!profileForm.logoDataUrl) {
      errors.logoDataUrl = 'Logo Sekolah wajib diunggah (.jpg, .png, .svg, .webp maks 100 KB).';
    }
    if (!profileForm.schoolName.trim()) {
      errors.schoolName = 'Nama Sekolah wajib diisi.';
    }
    if (!profileForm.jalan.trim()) {
      errors.jalan = 'Nama Jalan wajib diisi.';
    }
    if (!profileForm.rtRw.trim()) {
      errors.rtRw = 'RT / RW wajib diisi.';
    }
    if (!profileForm.kelurahan.trim()) {
      errors.kelurahan = 'Kelurahan wajib diisi.';
    }
    if (!profileForm.kecamatan.trim()) {
      errors.kecamatan = 'Kecamatan wajib diisi.';
    }
    if (!profileForm.kabupatenKota.trim()) {
      errors.kabupatenKota = 'Kabupaten/Kota wajib diisi.';
    }
    if (!profileForm.provinsi.trim()) {
      errors.provinsi = 'Provinsi wajib diisi.';
    }
    setProfileErrors(errors);

    const firstErrorKey = Object.keys(errors)[0];
    if (firstErrorKey) {
      const targetEl = profileFieldRefs.current[firstErrorKey];
      if (targetEl?.scrollIntoView) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await saveOfficialPortal({
        ...portalData,
        schoolSlug: activeSlug,
        schoolName: profileForm.schoolName.trim(),
        schoolProfile: {
          ...profileForm,
          schoolName: profileForm.schoolName.trim(),
        },
      });
      setPortalData(updated);
      showToast('Profil Sekolah berhasil disimpan dan disinkronkan!');
    } finally {
      setSavingProfile(false);
    }
  };

  // HANDLER TAB 2: PEMBERKASAN
  const handleDocumentUpload = async (docItem, e) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses unggah berkas dibatasi.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploadError('');
    if (file.size > 1024 * 1024) {
      setDocUploadError(
        `Ukuran berkas "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) melebihi batas maksimal 1 MB.`
      );
      return;
    }
    setUploadingDocId(docItem.id);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const nextDocs = {
        ...(portalData?.documents || {}),
        [docItem.id]: {
          docId: docItem.id,
          title: docItem.title,
          fileName: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          fileType: file.type || 'application/octet-stream',
          fileDataUrl: dataUrl,
          status: 'terunggah',
          uploadedAt: new Date().toISOString(),
        },
      };
      const updated = await saveOfficialPortal({
        ...portalData,
        schoolSlug: activeSlug,
        documents: nextDocs,
      });
      setPortalData(updated);
      showToast(`Dokumen "${docItem.title}" berhasil diunggah!`);
    } catch (err) {
      setDocUploadError(err.message || 'Gagal mengunggah dokumen.');
    } finally {
      setUploadingDocId('');
    }
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus berkas dibatasi.');
      return;
    }
    const nextDocs = { ...(portalData?.documents || {}) };
    delete nextDocs[docId];
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      documents: nextDocs,
    });
    setPortalData(updated);
    showToast(`Dokumen "${docTitle}" telah dihapus.`);
  };

  const handleVerifyDocumentByAdmin = async (docId) => {
    if (!hasAdminAccess) return;
    const currentDoc = portalData?.documents?.[docId];
    if (!currentDoc) return;
    const nextStatus = currentDoc.status === 'terverifikasi' ? 'terunggah' : 'terverifikasi';
    const nextDocs = {
      ...(portalData?.documents || {}),
      [docId]: {
        ...currentDoc,
        status: nextStatus,
        verifiedAt: new Date().toISOString(),
      },
    };
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      documents: nextDocs,
    });
    setPortalData(updated);
    showToast(`Status verifikasi dokumen diperbarui menjadi "${nextStatus.toUpperCase()}".`);
  };

  // HANDLER TAB 3: BIODATA PASUKAN & OFFICIAL
  const detectedSchoolName =
    profileForm.schoolName?.trim() ||
    portalData?.schoolProfile?.schoolName ||
    portalData?.schoolName ||
    'Nama Sekolah Belum Diisi';

  const handlePasukanPhotoChange = async (e) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setPasukanErrors((prev) => ({ ...prev, photoDataUrl: check.error }));
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setPasukanForm((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoFileName: file.name,
      photoSizeKb: Math.round(file.size / 1024),
    }));
    setPasukanErrors((prev) => ({ ...prev, photoDataUrl: '' }));
  };

  const handleSubmitPasukan = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses tambah/edit pasukan dibatasi.');
      return;
    }
    const errors = {};
    if (!pasukanForm.photoDataUrl) {
      errors.photoDataUrl = 'Foto profil pasukan wajib diunggah (.jpg/.png/.svg/.webp maks 100 KB).';
    }
    if (!pasukanForm.fullName.trim()) {
      errors.fullName = 'Nama Lengkap pasukan wajib diisi.';
    }
    if (!PASUKAN_POSITIONS.includes(pasukanForm.position)) {
      errors.position = 'Pilih posisi pasukan yang valid.';
    }
    const cleanNisn = String(pasukanForm.nisn || '').trim();
    if (!cleanNisn || !/^\d+$/.test(cleanNisn)) {
      errors.nisn = 'NISN wajib diisi dan hanya boleh berupa angka.';
    }
    setPasukanErrors(errors);
    const firstErr = Object.keys(errors)[0];
    if (firstErr) {
      const el = pasukanFieldRefs.current[firstErr];
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const currentList = Array.isArray(portalData?.pasukanList)
      ? [...portalData.pasukanList]
      : [];
    if (!editingPasukanId && currentList.length >= 18) {
      setPasukanErrors({ fullName: 'Kuota Pasukan telah mencapai batas maksimal 18 orang.' });
      return;
    }

    const memberPayload = {
      id: editingPasukanId || `PAS-${Date.now()}`,
      photoDataUrl: pasukanForm.photoDataUrl,
      photoFileName: pasukanForm.photoFileName,
      photoSizeKb: pasukanForm.photoSizeKb,
      fullName: pasukanForm.fullName.trim(),
      schoolName: detectedSchoolName,
      position: pasukanForm.position,
      nisn: cleanNisn,
      updatedAt: new Date().toISOString(),
    };

    const nextList = editingPasukanId
      ? currentList.map((m) => (m.id === editingPasukanId ? memberPayload : m))
      : [...currentList, memberPayload];

    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      pasukanList: nextList,
    });
    setPortalData(updated);
    setPasukanForm({
      photoDataUrl: '',
      photoFileName: '',
      photoSizeKb: 0,
      fullName: '',
      position: 'Pasukan Inti',
      nisn: '',
    });
    setEditingPasukanId(null);
    setShowPasukanForm(false);
    showToast(`Biodata Pasukan "${memberPayload.fullName}" berhasil disimpan!`);
  };

  const handleDeletePasukan = async (memberId, memberName) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus pasukan dibatasi.');
      return;
    }
    const nextList = (portalData?.pasukanList || []).filter((m) => m.id !== memberId);
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      pasukanList: nextList,
    });
    setPortalData(updated);
    showToast(`Data pasukan "${memberName}" telah dihapus.`);
  };

  const handleOfficialPhotoChange = async (e) => {
    if (!canEdit) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) {
      setOfficialErrors((prev) => ({ ...prev, photoDataUrl: check.error }));
      return;
    }
    const dataUrl = await readFileAsDataUrl(file);
    setOfficialForm((prev) => ({
      ...prev,
      photoDataUrl: dataUrl,
      photoFileName: file.name,
      photoSizeKb: Math.round(file.size / 1024),
    }));
    setOfficialErrors((prev) => ({ ...prev, photoDataUrl: '' }));
  };

  const handleSubmitOfficial = async (e) => {
    e?.preventDefault();
    if (!canEdit) {
      showToast('Mode Tamu: Akses tambah/edit official dibatasi.');
      return;
    }
    const errors = {};
    if (!officialForm.photoDataUrl) {
      errors.photoDataUrl = 'Foto profil official wajib diunggah (.jpg/.png/.svg/.webp maks 100 KB).';
    }
    if (!officialForm.fullName.trim()) {
      errors.fullName = 'Nama Lengkap official wajib diisi.';
    }
    if (!OFFICIAL_POSITIONS.includes(officialForm.position)) {
      errors.position = 'Pilih posisi Official 1 atau Official 2.';
    }
    setOfficialErrors(errors);
    const firstErr = Object.keys(errors)[0];
    if (firstErr) {
      const el = officialFieldRefs.current[firstErr];
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const currentList = Array.isArray(portalData?.officialList)
      ? [...portalData.officialList]
      : [];
    if (!editingOfficialId && currentList.length >= 2) {
      setOfficialErrors({ fullName: 'Kuota Official telah mencapai batas maksimal 2 orang.' });
      return;
    }

    const offPayload = {
      id: editingOfficialId || `OFF-${Date.now()}`,
      photoDataUrl: officialForm.photoDataUrl,
      photoFileName: officialForm.photoFileName,
      photoSizeKb: officialForm.photoSizeKb,
      fullName: officialForm.fullName.trim(),
      schoolName: detectedSchoolName,
      position: officialForm.position,
      updatedAt: new Date().toISOString(),
    };

    const nextList = editingOfficialId
      ? currentList.map((o) => (o.id === editingOfficialId ? offPayload : o))
      : [...currentList, offPayload];

    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      officialList: nextList,
    });
    setPortalData(updated);
    setOfficialForm({
      photoDataUrl: '',
      photoFileName: '',
      photoSizeKb: 0,
      fullName: '',
      position: 'Official 1',
    });
    setEditingOfficialId(null);
    setShowOfficialForm(false);
    showToast(`Biodata ${offPayload.position} "${offPayload.fullName}" berhasil disimpan!`);
  };

  const handleDeleteOfficial = async (offId, offName) => {
    if (!canEdit) {
      showToast('Mode Tamu: Akses hapus official dibatasi.');
      return;
    }
    const nextList = (portalData?.officialList || []).filter((o) => o.id !== offId);
    const updated = await saveOfficialPortal({
      ...portalData,
      schoolSlug: activeSlug,
      officialList: nextList,
    });
    setPortalData(updated);
    showToast(`Data official "${offName}" telah dihapus.`);
  };

  const handleEditPasukan = (p) => {
    if (!canEdit) return;
    setEditingPasukanId(p.id);
    setPasukanForm({
      fullName: p.fullName || '',
      position: p.position || 'Pasukan Inti',
      nisn: p.nisn || '',
      photoDataUrl: p.photoDataUrl || '',
      photoFileName: p.photoFileName || '',
      photoSizeKb: p.photoSizeKb || 0,
    });
    setShowPasukanForm(true);
    setShowOfficialForm(false);
  };

  const handleCancelPasukanForm = () => {
    setEditingPasukanId(null);
    setShowPasukanForm(false);
    if (typeof setPasukanErrors === 'function') setPasukanErrors({});
  };

  const handleEditOfficial = (o) => {
    if (!canEdit) return;
    setEditingOfficialId(o.id);
    setOfficialForm({
      fullName: o.fullName || '',
      position: o.position || 'Official 1',
      photoDataUrl: o.photoDataUrl || '',
      photoFileName: o.photoFileName || '',
      photoSizeKb: o.photoSizeKb || 0,
    });
    setShowOfficialForm(true);
    setShowPasukanForm(false);
  };

  const handleCancelOfficialForm = () => {
    setEditingOfficialId(null);
    setShowOfficialForm(false);
    if (typeof setOfficialErrors === 'function') setOfficialErrors({});
  };

  return {
    handleSchoolLogoChange,
    handleProfileSubmit,
    handleDocUpload,
    handleDeleteDocument,
    handlePasukanPhotoUpload,
    handleSavePasukan,
    handleDeletePasukan,
    handleOfficialPhotoUpload,
    handleSaveOfficial,
    handleDeleteOfficial,
    handleEditPasukan,
    handleCancelPasukanForm,
    handleEditOfficial,
    handleCancelOfficialForm,
  };
}

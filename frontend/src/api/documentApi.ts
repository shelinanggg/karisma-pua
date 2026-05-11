import axiosInstance from './axiosInstance';

export type DokumenRef = {
  id?: string;
  namaFile?: string;
  fileName?: string;
};

const getDocumentId = (dokumen: DokumenRef | null | undefined) => dokumen?.id?.trim();

const getDocumentFilename = (dokumen: DokumenRef | null | undefined) =>
  dokumen?.namaFile || dokumen?.fileName || 'dokumen';

function openBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export async function openDokumen(dokumen: DokumenRef | null | undefined) {
  const id = getDocumentId(dokumen);
  if (!id) return;

  const response = await axiosInstance.get<Blob>(`/dokumen/${id}/lihat`, {
    responseType: 'blob',
  });
  openBlob(response.data);
}

export async function downloadDokumen(dokumen: DokumenRef | null | undefined) {
  const id = getDocumentId(dokumen);
  if (!id) return;

  const response = await axiosInstance.get<Blob>(`/dokumen/${id}/download`, {
    responseType: 'blob',
  });
  saveBlob(response.data, getDocumentFilename(dokumen));
}

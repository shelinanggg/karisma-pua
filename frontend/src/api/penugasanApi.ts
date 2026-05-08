import axiosInstance from "./axiosInstance";

export type PenugasanEmployee = {
  id: string;
  nip: string;
  nama: string;
  role: string;
  fungsional: string;
  pangkat: string;
  golongan: string;
  assignmentCount: number;
};

export type PenugasanButirPayload = {
  idPengguna: string;
  idButirKegiatan: string;
  idPeriodeSkp: string;
  deskripsi?: string;
  uraian?: string;
  targetKetercapaian?: string;
};

export type PenugasanButir = {
  id: string;
  idPengguna: string;
  idButirKegiatan: string;
  idPeriodeSkp: string;
  namaKegiatan: string;
  deskripsi: string;
  uraian: string;
  targetKetercapaian: string;
  status: string;
};

export type MyPenugasanButir = PenugasanButir & {
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
  realisasiTotal: number;
  realisasiCount: number;
};

export type PenugasanButirUpdatePayload = {
  deskripsi?: string;
  uraian?: string;
  targetKetercapaian?: string;
};

export type MyRealisasiKegiatan = {
  id: string;
  idPenggunaKegiatan: string;
  namaKegiatan: string;
  tanggalRealisasi: string;
  realisasiTarget: string;
  keterangan: string;
};

export type MyRealisasiKegiatanPayload = {
  idPenggunaKegiatan: string;
  tanggalRealisasi: string;
  realisasiTarget: string;
  keterangan: string;
};

export type PenugasanTambahanEmployee = {
  id: string;
  nama: string;
  nip: string;
};

export type PenugasanTambahan = {
  id: string;
  namaKegiatan: string;
  deskripsiKegiatan: string;
  status: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  suratTugas: string;
  assignedEmployees: PenugasanTambahanEmployee[];
};

export type PenugasanTambahanPayload = {
  assignedEmployeeIds: string[];
  namaKegiatan: string;
  deskripsiKegiatan?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
};

export type MyDashboardSummary = {
  summary: {
    achievementPercentage: number | null;
    realisasiTotal: number;
    targetKetercapaian: number;
    totalKegiatan: number;
  };
  timeline: {
    tmtKgb: string;
    tmtPensiun: string;
  };
  kinerja: MyPenugasanButir[];
  penugasanTambahan: PenugasanTambahan[];
};

export async function getPenugasanEmployees(params?: { idPeriodeSkp?: string }) {
  const response = await axiosInstance.get<{ data: PenugasanEmployee[] }>("/penugasan/pegawai", { params });
  return response.data.data;
}

export async function createPenugasanButir(payload: PenugasanButirPayload) {
  const response = await axiosInstance.post("/penugasan/butir", payload);
  return response.data.data;
}

export async function getPenugasanButirByPegawai(pegawaiId: string) {
  const response = await axiosInstance.get<{ data: PenugasanButir[] }>(`/penugasan/butir/pegawai/${pegawaiId}`);
  return response.data.data;
}

export async function getMyPenugasanButir() {
  const response = await axiosInstance.get<{ data: MyPenugasanButir[] }>("/penugasan/butir/saya");
  return response.data.data;
}

export async function getMyDashboardSummary(params?: { idPeriodeSkp?: string; tahun?: number }) {
  const response = await axiosInstance.get<{ data: MyDashboardSummary }>("/penugasan/dashboard/saya", { params });
  return response.data.data;
}

export async function updatePenugasanButir(id: string, payload: PenugasanButirUpdatePayload) {
  const response = await axiosInstance.patch<{ data: PenugasanButir }>(`/penugasan/butir/${id}`, payload);
  return response.data.data;
}

export async function updateMyPenugasanButirTarget(id: string, payload: PenugasanButirUpdatePayload) {
  const response = await axiosInstance.patch<{ data: MyPenugasanButir }>(`/penugasan/butir/saya/${id}/target`, payload);
  return response.data.data;
}

export async function deletePenugasanButir(id: string) {
  const response = await axiosInstance.delete(`/penugasan/butir/${id}`);
  return response.data;
}

export async function getMyRealisasiKegiatan() {
  const response = await axiosInstance.get<{ data: MyRealisasiKegiatan[] }>("/penugasan/realisasi/saya");
  return response.data.data;
}

export async function createMyRealisasiKegiatan(payload: MyRealisasiKegiatanPayload) {
  const response = await axiosInstance.post<{ data: MyRealisasiKegiatan }>("/penugasan/realisasi/saya", payload);
  return response.data.data;
}

export async function getPenugasanTambahanList() {
  const response = await axiosInstance.get<{ data: PenugasanTambahan[] }>("/penugasan/tambahan");
  return response.data.data;
}

export async function getMyPenugasanTambahanList() {
  const response = await axiosInstance.get<{ data: PenugasanTambahan[] }>("/penugasan/tambahan/saya");
  return response.data.data;
}

export async function getPenugasanTambahan(id: string) {
  const response = await axiosInstance.get<{ data: PenugasanTambahan }>(`/penugasan/tambahan/${id}`);
  return response.data.data;
}

export async function createPenugasanTambahan(payload: PenugasanTambahanPayload) {
  const response = await axiosInstance.post<{ data: PenugasanTambahan }>("/penugasan/tambahan", payload);
  return response.data.data;
}

export async function updatePenugasanTambahan(id: string, payload: PenugasanTambahanPayload) {
  const response = await axiosInstance.patch<{ data: PenugasanTambahan }>(`/penugasan/tambahan/${id}`, payload);
  return response.data.data;
}

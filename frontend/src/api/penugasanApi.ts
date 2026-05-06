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

export type PenugasanButirUpdatePayload = {
  deskripsi?: string;
  uraian?: string;
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

export async function updatePenugasanButir(id: string, payload: PenugasanButirUpdatePayload) {
  const response = await axiosInstance.patch<{ data: PenugasanButir }>(`/penugasan/butir/${id}`, payload);
  return response.data.data;
}

export async function deletePenugasanButir(id: string) {
  const response = await axiosInstance.delete(`/penugasan/butir/${id}`);
  return response.data;
}

export async function getPenugasanTambahanList() {
  const response = await axiosInstance.get<{ data: PenugasanTambahan[] }>("/penugasan/tambahan");
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

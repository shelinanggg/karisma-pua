import axiosInstance from "./axiosInstance";

export type RelationOption = {
  id: string;
  label: string;
};

export type Pegawai = {
  id: number;
  nip: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  role_id: string;
  fungsional: string;
  tmt_golongan: string;
  pendidikan: string;
  kualifikasi: string;
  tmt_kgb: string;
  tmt_jabatan: string;
  tmt_pensiun: string;
  jabatan_id: string;
  pangkat_id: string;
  golongan_id: string;
  penempatan_id: string;
  sertifikasi_id: string;
};

export type PegawaiReferences = {
  roles: RelationOption[];
  jabatan: RelationOption[];
  pangkat: RelationOption[];
  golongan: RelationOption[];
  penempatan: RelationOption[];
  sertifikasi: RelationOption[];
};

export type PegawaiPayload = Omit<Pegawai, "id">;

export async function getPegawaiList() {
  const response = await axiosInstance.get<{ data: Pegawai[] }>("/pegawai");
  return response.data.data;
}

export async function getPegawaiReferences() {
  const response = await axiosInstance.get<{ data: PegawaiReferences }>("/pegawai/references");
  return response.data.data;
}

export async function createPegawai(payload: PegawaiPayload) {
  const response = await axiosInstance.post<{ data: Pegawai }>("/pegawai", payload);
  return response.data.data;
}

export async function updatePegawai(id: number, payload: PegawaiPayload) {
  const response = await axiosInstance.patch<{ data: Pegawai }>(`/pegawai/${id}`, payload);
  return response.data.data;
}

export async function deletePegawai(id: number) {
  await axiosInstance.delete(`/pegawai/${id}`);
}

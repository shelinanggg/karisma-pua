import axiosInstance from "./axiosInstance";

export type PeriodeSkp = {
  id: number;
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
};

export type PeriodeSkpPayload = {
  tahun: number;
  tanggalMulai: string;
  tanggalSelesai: string;
};

export async function getPeriodeSkpList() {
  const response = await axiosInstance.get<{ data: PeriodeSkp[] }>("/periode-skp");
  return response.data.data;
}

export async function createPeriodeSkp(payload: PeriodeSkpPayload) {
  const response = await axiosInstance.post<{ data: PeriodeSkp }>("/periode-skp", payload);
  return response.data.data;
}

export async function updatePeriodeSkp(id: number, payload: PeriodeSkpPayload) {
  const response = await axiosInstance.patch<{ data: PeriodeSkp }>(`/periode-skp/${id}`, payload);
  return response.data.data;
}

export async function deletePeriodeSkp(id: number) {
  await axiosInstance.delete(`/periode-skp/${id}`);
}

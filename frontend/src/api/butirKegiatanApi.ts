import axiosInstance from "./axiosInstance";

export type ButirKegiatan = {
  id: number;
  name: string;
  activeParticipants: number;
};

export type ButirKegiatanPayload = {
  name: string;
};

export async function getButirKegiatanList() {
  const response = await axiosInstance.get<{ data: ButirKegiatan[] }>("/butir-kegiatan");
  return response.data.data;
}

export async function createButirKegiatan(payload: ButirKegiatanPayload) {
  const response = await axiosInstance.post<{ data: ButirKegiatan }>("/butir-kegiatan", payload);
  return response.data.data;
}

export async function updateButirKegiatan(id: number, payload: ButirKegiatanPayload) {
  const response = await axiosInstance.patch<{ data: ButirKegiatan }>(`/butir-kegiatan/${id}`, payload);
  return response.data.data;
}

export async function deleteButirKegiatan(id: number) {
  await axiosInstance.delete(`/butir-kegiatan/${id}`);
}

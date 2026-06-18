import axiosInstance from './axiosInstance';

export type Jabatan = {
  id: number;
  name: string;
  coefficientPerYear: number | null;
  promotionCreditTarget: number | null;
  employeeCount: number;
};

export type JabatanPayload = {
  name: string;
  coefficientPerYear: number | null;
  promotionCreditTarget: number | null;
};

export async function getJabatanList() {
  const response = await axiosInstance.get<{ data: Jabatan[] }>('/jabatan');
  return response.data.data;
}

export async function createJabatan(payload: JabatanPayload) {
  const response = await axiosInstance.post<{ data: Jabatan }>('/jabatan', payload);
  return response.data.data;
}

export async function updateJabatan(id: number, payload: JabatanPayload) {
  const response = await axiosInstance.patch<{ data: Jabatan }>(`/jabatan/${id}`, payload);
  return response.data.data;
}

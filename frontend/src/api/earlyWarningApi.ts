import axiosInstance from "./axiosInstance";

export type KgbWarning = {
  id: string;
  name: string;
  nip: string;
  tmtKgb: string;
  daysLeft: number;
};

export type PensionWarning = {
  id: string;
  name: string;
  nip: string;
  tmtPension: string;
  daysLeft: number;
};

export type PromotionWarning = {
  id: string;
  name: string;
  nip: string;
  currentScore: number;
  requiredScore: number;
  remainingScore: number;
  currentJabatanId: string;
  currentJabatan: string;
  coefficientPerYear: number;
  eligibleJabatan: PromotionJabatanOption[];
};

export type PromotionJabatanOption = {
  id: string;
  name: string;
  coefficientPerYear: number | null;
  targetScore: number | null;
};

export type EarlyWarningData = {
  jabatan: PromotionWarning[];
  kgb: KgbWarning[];
  pensiun: PensionWarning[];
};

export async function getEarlyWarningData() {
  const response = await axiosInstance.get<{ data: EarlyWarningData }>("/pegawai/early-warning");
  return response.data.data;
}

export async function processPromotionJabatan(idPengguna: string, idJabatan: string) {
  const response = await axiosInstance.patch(`/pegawai/${idPengguna}/promotion-jabatan`, { idJabatan });
  return response.data.data;
}

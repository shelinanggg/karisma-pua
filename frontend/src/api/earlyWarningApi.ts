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

export type EarlyWarningData = {
  kgb: KgbWarning[];
  pensiun: PensionWarning[];
};

export async function getEarlyWarningData() {
  const response = await axiosInstance.get<{ data: EarlyWarningData }>("/pegawai/early-warning");
  return response.data.data;
}

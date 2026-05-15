import axiosInstance from "./axiosInstance";

export type DashboardKpi = {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: string;
};

export type DashboardKegiatanPegawai = {
  nama: string;
  inisial: string;
  skpSelesai: number;
  skpTarget: number;
};

export type DashboardKegiatan = {
  id: number;
  namaKegiatan: string;
  unitKerja: string;
  tujuanSKP: number;
  skpSelesai: number;
  jumlahPegawai: number;
  pegawai: DashboardKegiatanPegawai[];
};

export type StatisticItem = {
  label: string;
  value: number;
  percentage: number;
};

export type EmployeeStatistics = {
  golongan: StatisticItem[];
  pendidikan: StatisticItem[];
  fungsional: StatisticItem[];
  jabatan: StatisticItem[];
};

export type DashboardUtamaData = {
  kpis: DashboardKpi[];
  kegiatan: DashboardKegiatan[];
  statistics?: EmployeeStatistics;
};

export async function getDashboardUtamaData(params?: { idPeriodeSkp?: string }) {
  const response = await axiosInstance.get<{ data: DashboardUtamaData }>("/penugasan/dashboard/utama", { params });
  return response.data.data;
}

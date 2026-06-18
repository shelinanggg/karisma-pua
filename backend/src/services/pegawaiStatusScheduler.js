import { deactivateRetiredPegawai } from "../repositories/pegawai.repository.js";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

const updateRetiredPegawaiStatus = async () => {
  try {
    const updatedCount = await deactivateRetiredPegawai();

    if (updatedCount > 0) {
      console.log(`${updatedCount} pegawai dinonaktifkan otomatis karena telah mencapai TMT pensiun.`);
    }
  } catch (error) {
    console.error("Gagal memperbarui status pegawai berdasarkan TMT pensiun.", error);
  }
};

export const startPegawaiStatusScheduler = () => {
  void updateRetiredPegawaiStatus();

  const timer = setInterval(() => {
    void updateRetiredPegawaiStatus();
  }, CHECK_INTERVAL_MS);

  timer.unref();
};

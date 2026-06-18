import { ensureUpcomingPeriodeSkp } from "../repositories/periodeSkp.repository.js";

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

const checkUpcomingPeriode = async () => {
  try {
    const periode = await ensureUpcomingPeriodeSkp();
    if (periode) {
      console.log(`Periode SKP ${periode.tahun} berhasil dibuat otomatis.`);
    }
  } catch (error) {
    console.error("Gagal menjalankan pembuatan periode SKP otomatis.", error);
  }
};

export const startPeriodeSkpScheduler = () => {
  void checkUpcomingPeriode();

  const timer = setInterval(() => {
    void checkUpcomingPeriode();
  }, CHECK_INTERVAL_MS);

  timer.unref();
};

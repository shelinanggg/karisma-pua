import { env } from "./config/env.js";
import app from "./app.js";
import { startPeriodeSkpScheduler } from "./services/periodeSkpScheduler.js";

const port = env.PORT || 5000;

const server = app.listen(port);

server.on("listening", () => {
  console.log(`Server running on port ${port}`);
  startPeriodeSkpScheduler();
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} sudah dipakai. Matikan proses backend lama atau gunakan PORT lain.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

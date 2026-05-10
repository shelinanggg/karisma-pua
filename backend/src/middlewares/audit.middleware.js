import { createAuditLog } from "../repositories/sistem.repository.js";
import { findUserProfileById } from "../repositories/user.repository.js";

const mutatingMethods = new Set(["POST", "PATCH", "PUT", "DELETE"]);
const ignoredPrefixes = ["/api/auth", "/api/sistem"];

const actionByMethod = {
  POST: "create",
  PATCH: "update",
  PUT: "update",
  DELETE: "delete",
};

const getClientIp = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) return forwarded.split(",")[0].trim();
  return req.ip || req.socket?.remoteAddress || "";
};

const getResource = (req) => {
  const pathname = req.originalUrl.split("?")[0];
  const parts = pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  if (parts.length === 0) return "sistem";
  if (parts[0] === "penugasan" && parts[1]) return `${parts[0]}/${parts[1]}`;
  return parts[0];
};

const getResourceId = (req) => {
  const values = Object.values(req.params ?? {}).filter(Boolean);
  if (values.length > 0) return String(values[0]);

  const parts = req.originalUrl.split("?")[0].split("/").filter(Boolean);
  const last = parts[parts.length - 1];
  return /^\d+$/.test(last) ? last : null;
};

const getActionLabel = (method) => {
  if (method === "POST") return "membuat";
  if (method === "DELETE") return "menghapus";
  return "memperbarui";
};

const getActor = async (req) => {
  const idPengguna = req.user?.id_pengguna ?? null;
  const userRole = req.user?.role ?? null;

  if (!idPengguna) return { idPengguna: null, userName: null, userRole };

  try {
    const profile = await findUserProfileById(idPengguna);
    return {
      idPengguna,
      userName: profile?.nama ?? null,
      userRole: profile?.role ?? userRole,
    };
  } catch {
    return { idPengguna, userName: null, userRole };
  }
};

export const auditCrudActivity = (req, res, next) => {
  const shouldAudit =
    mutatingMethods.has(req.method) &&
    !ignoredPrefixes.some((prefix) => req.originalUrl.startsWith(prefix));

  if (!shouldAudit) {
    next();
    return;
  }

  res.on("finish", async () => {
    if (res.statusCode < 200 || res.statusCode >= 400) return;

    try {
      const actor = await getActor(req);
      const resource = getResource(req);
      const action = actionByMethod[req.method] ?? req.method.toLowerCase();
      const resourceId = getResourceId(req);

      await createAuditLog({
        ...actor,
        activityType: "CRUD",
        action,
        resource,
        resourceId,
        description: `${actor.userName || "Pengguna"} ${getActionLabel(req.method)} ${resource}.`,
        status: "Berhasil",
        ipAddress: getClientIp(req),
        userAgent: req.headers["user-agent"] || "",
        metadata: {
          method: req.method,
          path: req.originalUrl.split("?")[0],
          statusCode: res.statusCode,
        },
      });
    } catch {
      // Audit logging must never block the main request lifecycle.
    }
  });

  next();
};

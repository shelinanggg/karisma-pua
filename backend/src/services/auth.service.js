import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByNip } from "../repositories/user.repository.js";

export const login = async ({ nip, password }) => {
  const user = await findUserByNip(nip);

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);

  if (!isMatch) {
    throw new Error("Password salah");
  }

  const token = jwt.sign(
    {
      user_id: user.user_id,
      role: user.roles_name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    message: "Login berhasil",
    token,
    role: user.roles_name
  };
};
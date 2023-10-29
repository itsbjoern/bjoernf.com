import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "./database";

export const ensureAuth = async (token: string | undefined) => {
  if (!token) {
    throw new Error("No token");
  }

  const database = await getDb();
  const user = await database.users().findOne({ token });
  if (!user) {
    throw new Error("Invalid token");
  }
  return user;
};

export const generatePasswordHash = async (
  password: string,
  saltRounds = 12,
) => {
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  const base64Hash = Buffer.from(hash).toString("base64");
  return base64Hash;
};

export const checkPasswordHash = async (hashed: string, password: string) => {
  const originalHash = Buffer.from(hashed, "base64").toString("utf-8");
  const isValid = await bcrypt.compare(password, originalHash);
  return isValid;
};

export const createToken = (userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!);
  return token;
};

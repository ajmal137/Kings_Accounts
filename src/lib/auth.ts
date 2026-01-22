import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";
import type { SessionUser, UserRole } from "@/types/auth";

type SessionPayload = SessionUser & {
  issuedAt: number;
  expiresAt: number;
};

const SESSION_COOKIE = "kt_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

function getSecret() {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret";
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = 4 - (normalized.length % 4 || 4);
  const padded =
    normalized + (padding < 4 ? "=".repeat(padding) : "");
  return Buffer.from(padded, "base64").toString("utf8");
}

function signPayload(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function serializeSession(session: SessionPayload) {
  const body = toBase64Url(JSON.stringify(session));
  const signature = signPayload(body);
  return `${body}.${signature}`;
}

function deserializeSession(value: string): SessionPayload | null {
  const [body, signature] = value.split(".");
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = signPayload(body);
  const safeExpected = Buffer.from(expectedSignature);
  const safeActual = Buffer.from(signature);

  if (
    safeExpected.length !== safeActual.length ||
    !timingSafeEqual(safeExpected, safeActual)
  ) {
    return null;
  }

  try {
    const json = fromBase64Url(body);
    const parsed = JSON.parse(json) as SessionPayload;
    return parsed;
  } catch {
    return null;
  }
}

export async function authenticateUser(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const credential = await prisma.userCredential.findUnique({
    where: { username },
  });

  if (!credential) {
    return null;
  }

  const isValid = await compare(password, credential.passwordHash);
  if (!isValid) {
    return null;
  }

  const role = credential.role === "ADMIN" ? "ADMIN" : "USER";

  return {
    username: credential.username,
    role: role as UserRole,
  };
}

export async function createSession(user: SessionUser) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_MAX_AGE_SECONDS;

  const payload: SessionPayload = {
    ...user,
    issuedAt,
    expiresAt,
  };

  const store = await cookies();
  store.set(SESSION_COOKIE, serializeSession(payload), {
    ...COOKIE_OPTIONS,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

async function readSessionCookie() {
  try {
    const store = await cookies();
    return store.get(SESSION_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieValue = await readSessionCookie();
  if (!cookieValue) {
    return null;
  }

  const parsed = deserializeSession(cookieValue);
  if (!parsed) {
    await destroySession();
    return null;
  }

  if (parsed.expiresAt <= Math.floor(Date.now() / 1000)) {
    await destroySession();
    return null;
  }

  return parsed;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}


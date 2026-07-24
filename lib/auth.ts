import { getUser, type User } from "@netlify/identity";

export function isAdmin(user: User | null): boolean {
  return Boolean(user && (user.role === "admin" || user.roles?.includes("admin")));
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getUser();
  return isAdmin(user) ? user : null;
}

export async function getSignedInUser(): Promise<User | null> {
  return getUser();
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const forwardedHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? "https";
  const forwardedOrigin = forwardedHost ? `${forwardedProtocol}://${forwardedHost}` : null;
  const requestOrigin = new URL(request.url).origin;
  if (!origin || (origin !== requestOrigin && origin !== forwardedOrigin)) {
    throw new Error("Invalid request origin.");
  }
}

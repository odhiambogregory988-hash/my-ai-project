import { bench, describe } from "vitest";

// `lib/auth` reads the signing secret when the module is first evaluated, so it
// has to be set before the dynamic import below.
process.env.ADMIN_SESSION_SECRET =
  process.env.ADMIN_SESSION_SECRET || "benchmark-only-secret-value-do-not-use-in-production";

const { createAdminToken, isAdminTokenValid, isOwnerEmail } = await import("@/lib/auth");

const validToken = await createAdminToken();
const tamperedToken = `${validToken.slice(0, -6)}abcdef`;

const emails = [
  "odhiambogregory988@gmail.com",
  "ODHIAMBOGREGORY988@GMAIL.COM",
  "customer@example.com",
  "another.customer@example.com",
];

describe("admin session tokens", () => {
  bench("createAdminToken - sign HS256 JWT", async () => {
    await createAdminToken();
  });

  bench("isAdminTokenValid - valid token", async () => {
    await isAdminTokenValid(validToken);
  });

  bench("isAdminTokenValid - tampered signature", async () => {
    await isAdminTokenValid(tamperedToken);
  });

  bench("isAdminTokenValid - missing token", async () => {
    await isAdminTokenValid(undefined);
  });
});

describe("owner checks", () => {
  bench("isOwnerEmail - 100 checks", () => {
    for (let i = 0; i < 100; i++) {
      isOwnerEmail(emails[i % emails.length]);
    }
  });
});

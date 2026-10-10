import type { CookieJar } from "tough-cookie";

import { createLogger } from "./logger";

const log = createLogger("syncResponseCookies");

const getRawCookies = (response: Response) => {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const setCookieValue = response.headers.get("set-cookie");

  if (setCookieValue) {
    return [setCookieValue];
  }

  return [];
};

const getCookieNames = (rawCookies: string[]) =>
  rawCookies.map((raw) => raw.split("=")[0]?.trim()).filter(Boolean);

export async function syncResponseCookies(
  response: Response,
  currentUrl: string,
  jar: CookieJar,
): Promise<void> {
  const rawCookies = getRawCookies(response);

  log.debug(
    { url: currentUrl, count: rawCookies.length, names: getCookieNames(rawCookies) },
    "synced Set-Cookie headers",
  );

  for (const raw of rawCookies) {
    await jar.setCookie(raw, currentUrl);
  }
}

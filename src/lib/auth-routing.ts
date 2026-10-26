const APP_PATH = /^\/app(?:\/|$)/;

export function getPostAuthenticationPath(pathname: string, search: string) {
  const params = new URLSearchParams(search);
  const requested = params.get("returnTo");
  if (requested && requested.startsWith("/") && !requested.startsWith("//")) {
    const url = new URL(requested, "https://deg-worksuite.invalid");
    if (url.origin === "https://deg-worksuite.invalid" && APP_PATH.test(url.pathname)) {
      return `${url.pathname}${url.search}`;
    }
  }
  if (
    APP_PATH.test(pathname) &&
    pathname !== "/app" &&
    pathname !== "/app/" &&
    pathname !== "/app/dashboard"
  ) {
    return pathname;
  }
  return "/app/dashboard";
}

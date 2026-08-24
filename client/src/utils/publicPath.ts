// On a GitHub Pages project site (username.github.io/repo/) the app is
// served from a subpath instead of the domain root; on the custom domain
// (or any other host) it's served from "/". Computed once at module load,
// before the 404.html redirect trick (see public/404.html and the decoder
// script in index.html) has a chance to rewrite the URL to a deep path --
// react-router's basename below relies on that same ordering guarantee.
const appBasePath = window.location.hostname.endsWith("github.io")
  ? `/${window.location.pathname.split("/")[1] ?? ""}`
  : "";

export const basename = appBasePath || "/";

/**
 * Absolute URL for a file in `public/`. Runtime `<img>`/`<link>` src values
 * must use this instead of a relative path: relative paths resolve against
 * document.baseURI at the time they're set, which can be a deep route (the
 * decoder script above already restored the real URL by the time React
 * renders), producing the wrong path entirely.
 */
export function publicAsset(path: string): string {
  return `${appBasePath}/${path.replace(/^\/+/, "")}`;
}

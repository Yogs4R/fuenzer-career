import { useEffect } from "react";
import { useTranslation } from "../lib/i18n";

const BASE = "Fuenzer Career";

/**
 * Sets `document.title`, meta description, OG tags, and Twitter Card tags.
 * Re-fetches the i18n description key whenever `language` changes.
 * Restores previous values on unmount.
 *
 * @param page       Page name appended after "Fuenzer Career |" — pass `null` for the bare brand name.
 * @param descKey    i18n key for the meta description (e.g. "meta.home.desc").
 */
export function useSEOMeta(page: string | null, descKey: string) {
  const { t, language } = useTranslation();

  useEffect(() => {
    const title = page ? `${BASE} | ${page}` : BASE;
    const description = t(descKey);

    /* ── Snapshot current values for cleanup ── */
    const prev = {
      title: document.title,
      desc: getMetaContent('meta[name="description"]', "content"),
      ogTitle: getMetaContent('meta[property="og:title"]', "content"),
      ogDesc: getMetaContent('meta[property="og:description"]', "content"),
      twTitle: getMetaContent('meta[name="twitter:title"]', "content"),
      twDesc: getMetaContent('meta[name="twitter:description"]', "content"),
    };

    /* ── Apply new values ── */
    document.title = title;
    setMetaContent('meta[name="description"]', "name", "description", "content", description);
    setMetaContent('meta[property="og:title"]', "property", "og:title", "content", title);
    setMetaContent('meta[property="og:description"]', "property", "og:description", "content", description);
    setMetaContent('meta[name="twitter:title"]', "name", "twitter:title", "content", title);
    setMetaContent('meta[name="twitter:description"]', "name", "twitter:description", "content", description);

    /* ── Restore on unmount ── */
    return () => {
      document.title = prev.title;
      setMetaContent('meta[name="description"]', "name", "description", "content", prev.desc);
      setMetaContent('meta[property="og:title"]', "property", "og:title", "content", prev.ogTitle);
      setMetaContent('meta[property="og:description"]', "property", "og:description", "content", prev.ogDesc);
      setMetaContent('meta[name="twitter:title"]', "name", "twitter:title", "content", prev.twTitle);
      setMetaContent('meta[name="twitter:description"]', "name", "twitter:description", "content", prev.twDesc);
    };
  }, [page, language, descKey, t]);
}

/* ── Helpers ── */

function getMetaContent(selector: string, attr: string): string {
  return document.querySelector(selector)?.getAttribute(attr) ?? "";
}

function setMetaContent(
  selector: string,
  attrName: string,
  attrValue: string,
  contentAttr: string,
  content: string,
) {
  let el = document.querySelector(selector) as Element | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute(contentAttr, content);
}

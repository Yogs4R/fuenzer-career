import { useEffect } from "react";

const BASE = "Fuenzer Career";

/**
 * Sets `document.title` to `"Fuenzer Career | <page>"` and restores it on unmount.
 * Pass `null` or omit to show the default site title.
 */
export function usePageTitle(page: string | null) {
  useEffect(() => {
    const prev = document.title;
    document.title = page ? `${BASE} | ${page}` : BASE;
    return () => {
      document.title = prev;
    };
  }, [page]);
}

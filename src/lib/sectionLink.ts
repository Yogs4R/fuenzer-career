import type { NavigateFunction } from "react-router-dom";

export function handleSectionLink(
  e: React.MouseEvent<HTMLAnchorElement>,
  id: string,
  navigate?: NavigateFunction,
) {
  e.preventDefault();
  if (window.location.pathname === "/") {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  } else if (navigate) {
    navigate("/#" + id);
  } else {
    window.location.href = "/#" + id;
  }
}
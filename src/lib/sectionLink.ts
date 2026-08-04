export function handleSectionLink(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  if (window.location.pathname === "/") {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }
  // On other routes: browser navigates to /#id — full page load, then Dashboard hash effect scrolls
}
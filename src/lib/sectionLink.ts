export function handleSectionLink(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
  if (window.location.pathname === "/") {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  } else {
    // Explicitly redirect to /#id so the Dashboard's hash effect scrolls into view
    e.preventDefault();
    window.location.href = "/#" + id;
  }
}
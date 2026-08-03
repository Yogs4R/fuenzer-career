import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="bg-primary text-on-primary shadow-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="font-heading text-lg sm:text-xl font-semibold tracking-tight cursor-pointer transition-opacity duration-200 hover:opacity-90"
        >
          Fuenzer Career
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-white/80">
          <span className="hidden sm:inline">Interview Coach</span>
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span>Beta</span>
        </div>
      </div>
    </nav>
  );
}
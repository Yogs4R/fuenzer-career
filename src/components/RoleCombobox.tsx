import { useState, useRef, useEffect } from "react";

const presetRoles = [
  "Data Scientist",
  "Frontend Developer",
  "Product Manager",
  "Backend Developer",
  "Full Stack Developer",
  "UX Designer",
  "DevOps Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "Software Engineer",
];

interface RoleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  buttonText?: string;
  variant?: "hero" | "default";
}

export default function RoleCombobox({
  value,
  onChange,
  onSubmit,
  placeholder = "e.g. Frontend Developer",
  buttonText = "Start Target Research",
  variant = "default",
}: RoleComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const comboRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = `role-listbox-${Math.random().toString(36).slice(2, 8)}`;

  const isHero = variant === "hero";

  const filtered =
    value.trim() === ""
      ? presetRoles
      : presetRoles.filter((r) =>
          r.toLowerCase().includes(value.toLowerCase())
        );

  const handleSelect = (selected: string) => {
    onChange(selected);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (comboRef.current && !comboRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const inputClasses = isHero
    ? "w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/50 text-base focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent transition-all duration-200"
    : "w-full px-4 py-3 rounded-lg border border-border bg-white text-foreground placeholder-muted-foreground text-base focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all duration-200";

  const buttonClasses = isHero
    ? "btn-active px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-lg cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shrink-0"
    : "btn-active px-6 py-3 rounded-lg bg-accent hover:bg-accent/90 text-white font-semibold text-base shadow-md cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shrink-0";

  const chevronClasses = isHero
    ? "text-white/50 hover:text-white/80"
    : "text-muted-foreground hover:text-foreground";

  /** We no longer auto-focus on the listbox container.  The first
      listbox item gets automatic focus only while the list is open. */
  const listboxClasses =
    "absolute left-0 right-0 mt-1 rounded-lg shadow-xl border max-h-56 overflow-y-auto z-50" +
    (isHero ? " bg-white" : " bg-white border-border");

  return (
    <div
      ref={comboRef}
      className="relative"
      role="combobox"
      aria-expanded={isOpen}
      aria-controls={listId}
      aria-haspopup="listbox"
      aria-activedescendant={
        activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
      }
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Target job role
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id={`${listId}-input`}
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setIsOpen(true);
              setActiveIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={inputClasses}
            autoComplete="off"
          />
          {/* Chevron */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen((p) => !p)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${chevronClasses}`}
            aria-label={isOpen ? "Close role list" : "Open role list"}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
        <button onClick={onSubmit} className={buttonClasses}>
          {buttonText}
        </button>
      </div>

      {/* Dropdown listbox */}
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          className={listboxClasses}
          onMouseDown={(e) => e.preventDefault()}
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground text-center">
              No matching roles — press Enter to use "{value}"
            </li>
          ) : (
            filtered.map((r, i) => (
              <li
                key={r}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === activeIndex}
                onClick={() => handleSelect(r)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`px-4 py-2.5 text-sm text-left cursor-pointer transition-colors duration-100 ${
                  i === activeIndex
                    ? "bg-accent/10 text-accent font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {r}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
import { useState, useRef, useEffect } from "react";

// didn't like the prebuilt dropdown, select icon not obeying padding rules
export function CustomDropdown({ label, options, onSelect, displayValue }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-col text-xs relative" ref={containerRef}>
      <label className="text-(--text-muted) mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          bg-(--bg-subtle) border 
          border-(--border) rounded-lg
          px-3 py-1.5 
          text-xs text-left min-w-25
          text-(--text-primary) 
          hover:border-(--border-focus)
          transition-colors duration-200 
          flex justify-between items-center
          ${isOpen ? "border-(--border-focus) ring-1 ring-(--border-focus)" : ""}
        `}
      >
        {displayValue || "All"}
        <span
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          className="
            absolute 
            top-full left-0 mt-1 w-full z-50
            bg-(--bg-subtle) border border-(--border) rounded-lg
            shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100
        "
        >
          {options.map((opt) => (
            <div
              key={opt.label}
              onClick={() => {
                onSelect(opt.value);
                setIsOpen(false);
              }}
              className="
                px-3 py-2 
                cursor-pointer transition-colors
                hover:bg-(--border) 
                text-(--text-primary)
                first:rounded-t-lg 
                last:rounded-b-lg
              "
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

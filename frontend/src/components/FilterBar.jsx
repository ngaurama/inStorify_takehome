import { useState, useEffect, useRef } from "react";
import { CustomDropdown } from "./CustomDropdown";

const PRIORITIES = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];


export default function FilterBar({ filters, onChange }) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const debounceRef = useRef(null);

  // 300ms was fine for rerenders in filter checking without visual delay
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onChange((prev) => ({ ...prev, search: searchInput }));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput, onChange]);

  const hasFilters =
    filters.completed !== null || filters.priority || filters.search;

  return (
    <div className="flex flex-col gap-3">
      {/* search bar */}
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search…"
        className="
          w-full 
          bg-transparent 
          border-b border-(--border) 
          outline-none 
          py-1.5 
          text-sm font-light 
          text-(--text-primary) 
          transition-colors duration-200 
          focus:border-(--border-focus)"
      />

      <div className="flex items-center gap-3 flex-wrap">
        {/* status dropdown */}
        <CustomDropdown
          label="Status"
          displayValue={
            filters.completed === null
              ? "All"
              : filters.completed
                ? "Done"
                : "Pending"
          }
          options={[
            { label: "All", value: null },
            { label: "Pending", value: false },
            { label: "Done", value: true },
          ]}
          onSelect={(val) => onChange((prev) => ({ ...prev, completed: val }))}
        />

        {/* priority dropdown */}
        <CustomDropdown
          label="Priority"
          displayValue={
            filters.priority
              ? PRIORITIES.find(p => p.value === filters.priority)?.label
              : "All"
          }
          options={[
            { label: "All", value: null },
            ...PRIORITIES,
          ]}
          onSelect={(val) => 
            onChange((prev) => ({ 
              ...prev, 
              priority: val 
            }))
          }
        />

        {/* clear button */}
        {hasFilters && (
          <button
            onClick={() => {
              onChange({ completed: null, priority: null, search: "" });
              setSearchInput("");
            }}
            className="
              ml-auto
              px-3 py-1.5 
              text-xs rounded-lg 
              text-(--high) 
              hover:bg-(--bg-subtle) 
              transition-colors 
              cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

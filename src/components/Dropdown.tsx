"use client";

import { useEffect, useRef, useState } from "react";
import { IconChevronDown } from "@/components/icons";
import { useMountTransition } from "@/hooks/useMountTransition";

export type DropdownOption = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right";
};

const TRANSITION_MS = 150;

export function Dropdown({
  options,
  value,
  onChange,
  className = "",
  buttonClassName = "",
  align = "left",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const { shouldRender, visible } = useMountTransition(open, TRANSITION_MS);

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
    }
  }

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const option = options[highlighted];
      if (option) {
        onChange(option.value);
        setOpen(false);
      }
    }
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm cursor-pointer transition hover:border-mint-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint-500 ${buttonClassName}`}
      >
        <span className="truncate">{selected?.label ?? "Selecione"}</span>
        <IconChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {shouldRender && (
        <ul
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className={`absolute z-10 mt-1.5 min-w-full w-max max-w-xs max-h-64 overflow-auto rounded-xl border border-gray-100 bg-white py-1.5 shadow-lg origin-top transition-all duration-150 ease-out ${
            align === "right" ? "right-0" : "left-0"
          } ${visible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1"}`}
        >
          {options.map((option, index) => (
            <li key={option.value}>
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setHighlighted(index)}
                className={`w-full text-left px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                  option.value === value
                    ? "bg-mint-50 text-mint-700 font-medium"
                    : highlighted === index
                      ? "bg-gray-50 text-gray-700"
                      : "text-gray-700"
                }`}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

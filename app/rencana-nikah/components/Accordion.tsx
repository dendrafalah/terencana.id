"use client";
import { useState } from "react";

export default function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <button
        type="button"
        className="accordionHead"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="muted">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="accordionBody">{children}</div>}
    </div>
  );
}

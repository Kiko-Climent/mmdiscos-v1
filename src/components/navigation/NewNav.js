"use client";

import Link from "next/link";
import { useRouter } from "next/router";

const LINKS = [
  { label: "MM DISCOS", href: "/" },
  { label: "ABOUT", href: "/?focus=about", event: "mm-nav-about" },
  { label: "RELEASES", href: "/releases" },
  { label: "MANIFESTO", href: "/?focus=manifesto", event: "mm-nav-manifesto" },
];

export default function NewNav({ visible = true }) {
  const router = useRouter();

  const onLinkClick = (eventName) => (e) => {
    if (!eventName || router.pathname !== "/") return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent(eventName));
  };

  return (
    <nav
      aria-label="Primary"
      id="mm-new-nav"
      aria-hidden={!visible}
      inert={!visible ? true : undefined}
      className="fixed top-0 left-0 z-[9999] px-3 pt-2.5 transition-opacity duration-300"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <ul className="m-0 p-0 list-none flex flex-col">
        {LINKS.map(({ label, href, event }) => (
          <li key={label}>
            <Link
              href={href}
              scroll={event ? false : undefined}
              onClick={onLinkClick(event)}
              tabIndex={visible ? undefined : -1}
              className="block uppercase text-[18px] font-semibold tracking-[-0.06em] leading-[1.05] text-black no-underline whitespace-nowrap hover:opacity-45 transition-opacity duration-150"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

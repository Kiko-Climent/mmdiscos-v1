import "@/styles/globals.css";
import "@/styles/about.css";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const isHome = router.pathname === "/";

  const handleLogoClick = () => {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <>
      {/* Logo global persistente — en home el hero lo controla via GSAP; en el resto ya está visible */}
      <div
        id="mm-global-logo"
        className="mm-global-logo-nav"
        style={{ opacity: isHome ? 0 : 1, pointerEvents: isHome ? "none" : "auto", cursor: "pointer" }}
        onClick={handleLogoClick}
      >
        <img
          src="/logo/Balearic Sound System Logo.svg"
          alt="MM Discos"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
      <Component {...pageProps} />
    </>
  );
}

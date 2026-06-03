import MMNewestHero2_1 from "./MMNewestHero2_1";
import MMNewestHero2Mobile from "./MMNewestHero2Mobile";

// Render-both + CSS gobierna visibilidad (breakpoint 720px). Cada
// variante sólo registra triggers/listeners si su viewport coincide.
export default function MMNewestHero2Wrapper() {
  return (
    <>
      <div className="hidden min-[720px]:block">
        <MMNewestHero2_1 />
      </div>
      <div className="block min-[720px]:hidden">
        <MMNewestHero2Mobile />
      </div>
    </>
  );
}
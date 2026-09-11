import Highlights3_3Desktop from "./Highlights3_3Desktop";
import Highlights3_3Desktop_2 from "./Highlights3_3Desktop_2";
import Highlights3_3Mobile_2 from "./Highlights3_3Mobile_2";
import Highlights3_3Mobile3 from "./Highlights3_3Mobile3";
import NewHighlights from "@/components/NewHighlights/NewHighlights";
import NewHighlights2 from "@/components/NewHighlights/NewHighlights2";
import NewHighlightsMob from "@/components/NewHighlights/NewHighlightsMob";

// Ambas variantes se renderizan en SSR (cero hydration mismatch). Cada
// envoltorio se muestra/oculta vía media query Tailwind (breakpoint 900px).
// Cada componente decide internamente si crea sus ScrollTriggers según
// window.innerWidth — sólo la variante visible registra triggers.
//
// Por qué así y no con dynamic / swap:
//  - Renderizando en SSR, los useLayoutEffect de los hijos corren ANTES
//    que el de pages/index.js → cuando Lenis/normalizeScroll capturan
//    bounds, el pinSpacer ya está en el DOM.
//  - Sin swap → no hay creación/destrucción de pinSpacer en mid-flight
//    que ensucie las referencias internas de ScrollTrigger.
export default function Highlights2Wrapper() {
  return (
    <div id="mm-highlights">
      <div className="hidden min-[901px]:block">
        {/* <Highlights3_3Desktop_2 /> */}
        {/* <HighlightsHoverLayout6_1 /> */}
        <NewHighlights2 />
      </div>
      <div className="block min-[901px]:hidden">
        {/* <Highlights3_3Mobile3 /> */}
        <NewHighlightsMob />
      </div>
    </div>
  );
}
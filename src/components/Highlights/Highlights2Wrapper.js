import Highlights2Desktop from "./Highlights2Desktop";
import Highlights2_1Desktop from "./Highlights2_1Desktop";
import Highlights2_3Desktop from "./Highlights2_3Desktop";
import Highlights2Mobile from "./Highlights2Mobile";
import Highlights2_1Mobile from "./Highlights2_1Mobile";
import Highlights2_2Mobile from "./Highlights2_2Mobile";
import Highlights2_3Mobile from "./Highlights2_3Mobile";
import Highlights2_3_1Desktop from "./Highlights2_3_1Desktop";
import Highlights3Desktop from "./Highlights3Desktop";
import Highlights3_1Desktop from "./Highlights3_1Desktop";
import Highlights3_2Desktop from "./Highlights3_2Desktop";
import Highlights3_3Desktop from "./Highlights3_3Desktop";
import Highlights3Mobile from "./Highlights3Mobile";
import Highlights3_3Mobile from "./Highlights3_3Mobile";

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
    <>
      <div className="hidden min-[901px]:block">
        <Highlights3_3Desktop />
      </div>
      <div className="block min-[901px]:hidden">
        <Highlights3_3Mobile />
      </div>
    </>
  );
}
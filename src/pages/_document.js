import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/logo/MM.svg" type="image/svg+xml" />
        {/* Desactiva la restauración nativa de scroll ANTES de la
            hidratación. En móvil Chrome restaura la Y guardada de forma
            asíncrona en cuanto el documento alcanza su altura real, lo que
            dejaba la home a media altura tras refrescar (el logo fixed
            quedaba centrado sobre el contenido). Fijarlo aquí, antes de
            cualquier paint, evita que el navegador lo intente siquiera. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if('scrollRestoration' in history){history.scrollRestoration='manual';}}catch(e){}",
          }}
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

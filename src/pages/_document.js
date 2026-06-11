import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/logo/MM.svg" type="image/svg+xml" />
        {/* Desactiva la restauración nativa de scroll lo más pronto posible:
            este script corre en cada carga ANTES de cualquier paint, así que
            le gana a la restauración asíncrona del navegador (en móvil Chrome
            restaura la Y guardada cuando el documento alcanza su altura real,
            tras montar las secciones → la home quedaba a media altura tras
            refrescar, con el logo fixed centrado sobre el contenido).
            Fijarlo en useLayoutEffect llegaba tarde; aquí no.
            No afecta la navegación client-side (Manifesto/About/releases usan
            scroll programático propio). */}
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

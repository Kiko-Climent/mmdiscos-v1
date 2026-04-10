import {
  PANEL_FONT_SIZE,
  PANEL_LINE_HEIGHT,
  PANEL_TEXT,
} from "./constants";

/** Estilos compartidos de tipografía en paneles (inline para mantener el look actual) */
export const panelP = {
  margin: 0,
  fontSize: PANEL_FONT_SIZE,
  lineHeight: PANEL_LINE_HEIGHT,
  color: PANEL_TEXT,
};

export const panelPUpper = {
  ...panelP,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

export const panelPWide = {
  ...panelP,
  letterSpacing: "0.04em",
};

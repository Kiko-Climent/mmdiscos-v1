import { DataReleases } from "../data";

/** Mapa imagen → datos del release */
export const RELEASE_MAP = {};
DataReleases.forEach((r) => {
  if (r.image) RELEASE_MAP[r.image] = r;
});

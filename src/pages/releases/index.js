import dynamic from "next/dynamic";

const FinalReleases2 = dynamic(
  () => import("@/components/FinalReleases2/index"),
  { ssr: false }
);

export default function Releases() {
  return (
    <FinalReleases2 />
  );
}
import dynamic from "next/dynamic";

const FinalReleases4 = dynamic(
  () => import("@/components/FinalReleases4/index"),
  { ssr: false }
);

export default function Releases() {
  return (
    <FinalReleases4 />
  );
}

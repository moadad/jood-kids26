import TrackOrderClient from "./track-client";

export default function TrackOrderPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const o = typeof searchParams?.o === "string" ? searchParams.o : "";
  return <TrackOrderClient initialOrderNumber={o} />;
}

import FusionClient from "./FusionClient";

export default function FusionPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-[var(--background)] px-6 py-16">
      <div className="w-full max-w-2xl">
        <FusionClient />
      </div>
    </div>
  );
}

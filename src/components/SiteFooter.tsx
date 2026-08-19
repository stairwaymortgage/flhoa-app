import { DATA_SOURCE } from "@/lib/status";

export function SiteFooter() {
  return (
    <footer className="bg-navy-dark text-[#A9BDD1] text-xs mt-8">
      <div className="mx-auto max-w-content px-6 py-6 pb-10 flex justify-between flex-wrap gap-3">
        <span>© 2026 flhoaregistry.com · An independent directory of Florida public records</span>
        <span>
          Data: {DATA_SOURCE} · Not affiliated with the State of Florida ·{" "}
          <a href="/corrections" className="text-[#C8D4E0]">Corrections</a>
        </span>
      </div>
    </footer>
  );
}

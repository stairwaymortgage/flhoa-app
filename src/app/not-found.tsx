import Link from "next/link";
import { SearchBox } from "@/components/SearchBox";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-content px-6 py-20 text-center">
      <h1 className="font-serif font-black text-[32px] text-navy mb-2">Record not found</h1>
      <p className="text-mut mb-8 max-w-[560px] mx-auto">
        We couldn&apos;t find that record. Search the registry by association, firm, manager, or
        developer name to find what you&apos;re looking for.
      </p>
      <SearchBox variant="plain" />
      <p className="mt-6">
        <Link href="/" className="text-navy-light font-semibold">Return to the homepage</Link>
      </p>
    </div>
  );
}

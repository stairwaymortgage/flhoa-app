import { Breadcrumbs } from "@/components/ui";
import { SearchBox } from "@/components/SearchBox";

export const metadata = { title: "Verify a Florida CAM or Management Firm License" };

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-content px-6 pb-16">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Verify a License" }]} />
      <div className="max-w-[720px] mx-auto text-center pt-8">
        <h1 className="font-serif font-black text-[30px] mb-2 text-navy">Verify a License</h1>
        <p className="text-mut text-[15px] mb-7">
          Look up any Florida management firm or Community Association Manager (CAM) by name or license
          number to see its current registration status — sourced directly from state records.
        </p>
        <SearchBox variant="plain" />
        <p className="text-xs text-mut mt-4">
          Results show the status exactly as recorded by the Florida DBPR, with the raw status code
          shown for verification.
        </p>
      </div>
    </div>
  );
}

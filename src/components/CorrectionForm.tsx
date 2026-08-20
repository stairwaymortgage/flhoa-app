"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { submitCorrection } from "@/lib/data";

const ENTITY_LABELS: Record<string, string> = {
  association: "Association",
  firm: "Management firm",
  cam: "Licensed manager (CAM)",
  developer: "Developer",
};

export function CorrectionForm() {
  const params = useSearchParams();
  const entityType = params.get("type");
  const entitySlug = params.get("slug");
  const pageUrl = params.get("url");

  const [entityName, setEntityName] = useState(params.get("entity") ?? "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setState("sending");
    setError("");
    try {
      await submitCorrection({
        entityType,
        entitySlug,
        entityName: entityName.trim() || null,
        pageUrl,
        message: message.trim(),
        submitterEmail: email.trim() || null,
      });
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-serif text-[20px] font-bold text-navy mb-2">Thank you — request received</h2>
        <p className="text-sm text-mut">
          Your correction request has been logged for review against the underlying state record.
          We review every submission, but we can only publish what the official source supports —
          where the state record itself is wrong, it has to be corrected at the agency first.
        </p>
        {pageUrl && (
          <p className="text-sm mt-4">
            <a href={pageUrl} className="text-navy-light font-semibold">
              ← Back to the record
            </a>
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-line rounded-lg p-6">
      {entityType && (
        <p className="text-xs text-mut mb-4">
          Reporting on: <b className="text-ink">{ENTITY_LABELS[entityType] ?? entityType}</b>
          {pageUrl && (
            <>
              {" · "}
              <a href={pageUrl} className="text-navy-light">
                view the record
              </a>
            </>
          )}
        </p>
      )}

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Record name
        </span>
        <input
          type="text"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          placeholder="Name of the association, firm, manager or developer"
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Your email <span className="font-normal normal-case tracking-normal">(optional)</span>
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Only if you would like a reply"
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
        />
      </label>

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          What is incorrect? <span className="text-warn">*</span>
        </span>
        <textarea
          required
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe the specific field that is wrong and what the correct value should be. Citing the state record or filing that supports it helps us verify faster."
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
        />
      </label>

      {state === "error" && (
        <p className="text-[13px] text-warn mb-3">
          That did not go through: {error} Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending" || !message.trim()}
        className="bg-navy text-white font-bold text-[13px] px-6 py-2.5 rounded-[5px] disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Submit correction request"}
      </button>

      <p className="text-[11px] text-mut mt-4">
        Submissions are private — they are stored for our review and are never shown on the site.
        flhoaregistry.com is not affiliated with the State of Florida and cannot amend official
        state records.
      </p>
    </form>
  );
}

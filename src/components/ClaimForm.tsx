"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ROLES = [
  { value: "owner", label: "Owner in the community" },
  { value: "manager", label: "Community association manager (CAM)" },
  { value: "board", label: "Board member" },
  { value: "firm", label: "Management firm representative" },
];

const ENTITY_LABELS: Record<string, string> = {
  association: "Association",
  firm: "Management firm",
  cam: "Licensed manager (CAM)",
  developer: "Developer",
};

export function ClaimForm() {
  const params = useSearchParams();
  const entityType = params.get("type");
  const entitySlug = params.get("slug");

  const [entityName, setEntityName] = useState(params.get("entity") ?? "");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("owner");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const canSubmit = name.trim().length > 0 && email.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("sending");
    setError("");
    try {
      const { error: insertError } = await supabase.from("claims").insert({
        entity_type: entityType,
        entity_slug: entitySlug,
        entity_name: entityName.trim() || null,
        claimant_name: name.trim(),
        claimant_email: email.trim(),
        claimant_phone: phone.trim() || null,
        role,
        message: message.trim() || null,
      });
      if (insertError) throw new Error(insertError.message);
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed.");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="bg-white border border-line rounded-lg p-6">
        <h2 className="font-serif text-[20px] font-bold text-navy mb-2">
          Thank you — claim request received
        </h2>
        <p className="text-sm text-mut">
          We will verify your connection to this record against the state registry and follow up at
          the email address you provided. Verification protects every listing from being claimed by
          someone unconnected to the community.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-line rounded-lg p-6">
      {entityType && (
        <p className="text-xs text-mut mb-4">
          Claiming: <b className="text-ink">{ENTITY_LABELS[entityType] ?? entityType}</b>
        </p>
      )}

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Record you are claiming
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
          Your name <span className="text-warn">*</span>
        </span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
        />
      </label>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Email <span className="text-warn">*</span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
            Phone
          </span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Your role
        </span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm bg-white"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block mb-4">
        <span className="block text-[10px] font-bold tracking-[0.1em] uppercase text-mut mb-1.5">
          Anything we should know
        </span>
        <textarea
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How you are connected to this record, and what you would like updated."
          className="w-full border border-line rounded-[5px] px-3 py-2 text-sm"
        />
      </label>

      {state === "error" && (
        <p role="alert" className="text-[13px] text-warn mb-3">
          That did not go through: {error} Please try again.
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit || state === "sending"}
        className="bg-navy text-white font-bold text-[13px] px-6 py-2.5 rounded-[5px] disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Submit claim request"}
      </button>

      <p className="text-[11px] text-mut mt-4">
        Claim requests are private and are reviewed before any listing is updated. flhoaregistry.com
        is not affiliated with the State of Florida and cannot amend official state records.
      </p>
    </form>
  );
}

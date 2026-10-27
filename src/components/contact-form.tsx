"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { t } from "@/lib/i18n";

const ui = t();
const endpoint = "https://api.web3forms.com/submit";

type Status = "idle" | "sending" | "success" | "error";

const fieldClass =
  "mt-1 block w-full rounded-md border border-line-strong bg-white px-3 py-2 text-ink shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none";

/**
 * Contact form sent to Web3Forms (see ADR 0004). Without an access key
 * (NEXT_PUBLIC_FORM_ACCESS_KEY) it falls back to the e-mail address.
 */
export function ContactForm({ email, accessKey }: { email: string; accessKey?: string }) {
  const [status, setStatus] = useState<Status>("idle");

  if (!accessKey) {
    return (
      <p className="rounded-lg bg-primary-soft p-4 text-fg">
        {ui.contact.unavailable}{" "}
        <a href={`mailto:${email}`} className="font-semibold text-primary underline">
          {email}
        </a>
        .
      </p>
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          ...data,
          access_key: accessKey,
          subject: `${ui.contact.subjectPrefix}: ${String(data.subject ?? "")}`,
          from_name: ui.siteShortName,
        }),
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error("Form submission failed");
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  const required = (
    <span className="text-danger" aria-hidden="true">
      {" "}
      *
    </span>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5" aria-describedby="contact-status">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-fg">
          {ui.contact.name}
          {required}
          <input name="name" type="text" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-fg">
          {ui.contact.email}
          {required}
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </div>
      <label className="block text-sm font-medium text-fg">
        {ui.contact.subject}
        {required}
        <input name="subject" type="text" required className={fieldClass} />
      </label>
      <label className="block text-sm font-medium text-fg">
        {ui.contact.message}
        {required}
        <textarea name="message" required rows={6} className={fieldClass} />
      </label>
      {/* Honeypot: hidden from people, bots tend to tick it. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <label className="flex items-start gap-2 text-sm text-fg">
        <input type="checkbox" name="privacy" required className="mt-1 size-4 accent-primary" />
        <span>
          {ui.contact.privacy}{" "}
          <Link href="/politica-de-privacitat" className="text-primary underline">
            {ui.contact.privacyLink}
          </Link>
          .{required}
        </span>
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center rounded-md bg-primary px-6 py-3 font-semibold text-on-primary shadow-sm hover:bg-primary-hover disabled:opacity-60"
      >
        {status === "sending" ? ui.contact.sending : ui.contact.send}
      </button>
      <p id="contact-status" role="status" aria-live="polite" className="text-sm">
        {status === "success" && (
          <span className="font-medium text-success">{ui.contact.success}</span>
        )}
        {status === "error" && <span className="font-medium text-danger">{ui.contact.error}</span>}
      </p>
    </form>
  );
}

import { useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { submitLead } from "@/lib/leads.functions";

export type ContactFormProps = {
  /** Which website template this form belongs to (e.g. "business", "school", "hotel"). */
  template?: string;
  /** Optional preset subject value. */
  defaultSubject?: string;
  /** Show the company field. Default true. */
  showCompany?: boolean;
  /** Show the subject field. Default true. */
  showSubject?: boolean;
  /** Show the phone field. Default true. */
  showPhone?: boolean;
  /** Compact one-column layout. */
  compact?: boolean;
  /** Called after a successful submit. */
  onSuccess?: () => void;
  /** Optional heading rendered above the form. */
  className?: string;
};

type Errors = Partial<Record<"name" | "email" | "message" | "phone", string>>;

export function ContactForm({
  template = "default",
  defaultSubject,
  showCompany = true,
  showSubject = true,
  showPhone = true,
  compact = false,
  onSuccess,
  className,
}: ContactFormProps) {
  const submit = useServerFn(submitLead);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const mut = useMutation({
    mutationFn: (input: Parameters<typeof submit>[0]["data"]) => submit({ data: input }),
    onSuccess: () => {
      setDone(true);
      onSuccess?.();
    },
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const phone = String(fd.get("phone") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const subject = String(fd.get("subject") || "").trim();
    const message = String(fd.get("message") || "").trim();

    const next: Errors = {};
    if (!name) next.name = "Please enter your name";
    if (!email) next.email = "Please enter your email";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = "Enter a valid email";
    if (!message) next.message = "Please add a short message";
    if (phone && !/^[+\d\s()\-.]{5,}$/.test(phone)) next.phone = "Enter a valid phone";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    mut.mutate({
      name,
      email,
      phone: phone || undefined,
      company: company || undefined,
      subject: subject || defaultSubject || undefined,
      message,
      source_page: typeof window !== "undefined" ? window.location.pathname : undefined,
      website_template: template,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : undefined,
    });
  }

  if (done) {
    return (
      <div
        className={`glass rounded-[28px] p-8 text-center ${className ?? ""}`}
        role="status"
        aria-live="polite"
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full" style={{ background: "var(--gradient-brand)" }}>
          <CheckCircle2 className="h-7 w-7 text-white" />
        </div>
        <h3 className="mt-5 text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          Thanks — we'll be in touch
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Your message has been received. We usually reply within one business day.
        </p>
        <button
          type="button"
          onClick={() => {
            setDone(false);
            mut.reset();
          }}
          className="mt-6 rounded-full border border-border bg-background px-4 py-2 text-sm hover:-translate-y-0.5 hover:shadow"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`glass rounded-[28px] p-6 sm:p-8 ${className ?? ""}`} noValidate>
      <div className={compact ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"}>
        <Field label="Name" name="name" placeholder="Your name" error={errors.name} required />
        <Field label="Email" name="email" type="email" placeholder="you@brand.com" error={errors.email} required />
      </div>
      {(showPhone || showCompany) && (
        <div className={`mt-4 grid gap-4 ${showPhone && showCompany && !compact ? "sm:grid-cols-2" : ""}`}>
          {showPhone && <Field label="Phone" name="phone" type="tel" placeholder="+91 00000 00000" error={errors.phone} />}
          {showCompany && <Field label="Company" name="company" placeholder="Company (optional)" />}
        </div>
      )}
      {showSubject && (
        <div className="mt-4">
          <Field
            label="Subject"
            name="subject"
            placeholder={defaultSubject || "How can we help?"}
            defaultValue={defaultSubject}
          />
        </div>
      )}
      <div className="mt-4">
        <label htmlFor="message" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Tell us about goals, timeline and budget…"
          className="mt-2 w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          aria-invalid={!!errors.message}
        />
        {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
      </div>

      {mut.isError && (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{(mut.error as Error)?.message || "Something went wrong. Please try again."}</span>
        </div>
      )}

      <button type="submit" disabled={mut.isPending} className="btn-primary mt-6 w-full sm:w-auto">
        {mut.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          <>
            Send message <Send className="h-4 w-4" />
          </>
        )}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        aria-invalid={!!error}
        className="mt-2 w-full rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  useFlightPartnerStore,
  type FlightPartnerApplicationData,
} from "@/store/useFlightPartnerStore";
import { motion } from "framer-motion";
import {
  Plane,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Upload,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";

interface CertFile {
  file: File;
  preview: string;
  name: string;
}

const COUNTRY_CODES = [
  { code: "VN", label: "Vietnam" },
  { code: "TH", label: "Thailand" },
  { code: "SG", label: "Singapore" },
  { code: "MY", label: "Malaysia" },
  { code: "ID", label: "Indonesia" },
  { code: "PH", label: "Philippines" },
  { code: "JP", label: "Japan" },
  { code: "KR", label: "South Korea" },
  { code: "US", label: "United States" },
  { code: "GB", label: "United Kingdom" },
  { code: "AU", label: "Australia" },
  { code: "AE", label: "UAE" },
  { code: "QA", label: "Qatar" },
];

export function FlightOnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const { applyAsPartner, isApplying } = useFlightPartnerStore();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<FlightPartnerApplicationData>({
    airline_name: "",
    airline_code: "",
    email: "",
    phone: "",
    website: "",
    headquarters_country: "VN",
    headquarters_city: "",
    fleet_size: undefined,
    description: "",
    iata_membership_number: "",
    certificate_urls: [],
  });
  const [certs, setCerts] = useState<CertFile[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill email from Clerk
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.primaryEmailAddress?.emailAddress || "",
      }));
    }
  }, [user]);

  const update = (
    field: keyof FlightPartnerApplicationData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newCerts: CertFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        setErrors((prev) => ({
          ...prev,
          certs: "Only images and PDFs allowed",
        }));
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          certs: "Each file must be under 10 MB",
        }));
        continue;
      }
      newCerts.push({
        file,
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : "",
        name: file.name,
      });
    }
    if (newCerts.length) {
      setCerts((prev) => [...prev, ...newCerts]);
      setErrors((prev) => ({ ...prev, certs: "" }));
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeCert = (idx: number) => {
    setCerts((prev) => {
      const updated = [...prev];
      if (updated[idx].preview) URL.revokeObjectURL(updated[idx].preview);
      updated.splice(idx, 1);
      return updated;
    });
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.airline_name.trim())
      errs.airline_name = "Airline name is required";
    if (!formData.airline_code.trim())
      errs.airline_code = "IATA code is required";
    else if (!/^[A-Za-z0-9]{2,3}$/.test(formData.airline_code.trim()))
      errs.airline_code = "IATA code must be 2–3 alphanumeric characters";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Invalid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.headquarters_city?.trim())
      errs.headquarters_city = "City is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3) setStep(4);
  };

  const handleSubmit = async () => {
    const certUrls = certs.map((c) => c.name);
    const success = await applyAsPartner({
      ...formData,
      certificate_urls: certUrls,
    });
    if (success) router.push("/partner/flight");
  };

  const inputCls = (field: string) => `
        w-full px-4 py-3 rounded-xl border text-sm transition-colors
        bg-white/5 text-white placeholder:text-slate-500
        ${
          errors[field]
            ? "border-red-500/50 focus:ring-red-500 focus:border-red-500"
            : "border-white/10 focus:ring-sky-500 focus:border-sky-500"
        }
        focus:outline-none focus:ring-2
    `;

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Flight Partner Application
          </h1>
          <p className="text-slate-400">
            List your airline on TripC Marketplace
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-sky-500" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {/* ── Step 1: Airline Info ── */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Airline Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Airline Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.airline_name}
                  onChange={(e) => update("airline_name", e.target.value)}
                  placeholder="e.g. Vietnam Airlines"
                  className={inputCls("airline_name")}
                />
                {errors.airline_name && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.airline_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  IATA Airline Code <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.airline_code}
                  onChange={(e) =>
                    update("airline_code", e.target.value.toUpperCase())
                  }
                  maxLength={3}
                  placeholder="e.g. VN"
                  className={inputCls("airline_code")}
                />
                {errors.airline_code ? (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.airline_code}
                  </p>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    2–3 character IATA designator (e.g. VN, SQ, TG)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Business Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="partner@yourairline.com"
                  className={inputCls("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+84 xxx xxx xxxx"
                  className={inputCls("phone")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => update("website", e.target.value)}
                  placeholder="https://yourairline.com"
                  className={inputCls("website")}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Operations ── */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Operations & Headquarters
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Headquarters City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.headquarters_city || ""}
                  onChange={(e) => update("headquarters_city", e.target.value)}
                  placeholder="e.g. Hanoi"
                  className={inputCls("headquarters_city")}
                />
                {errors.headquarters_city && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.headquarters_city}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Headquarters Country
                </label>
                <select
                  value={formData.headquarters_country || "VN"}
                  onChange={(e) =>
                    update("headquarters_country", e.target.value)
                  }
                  className={inputCls("headquarters_country")}
                >
                  {COUNTRY_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Fleet Size
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.fleet_size || ""}
                  onChange={(e) => update("fleet_size", Number(e.target.value))}
                  placeholder="Number of aircraft in service"
                  className={inputCls("fleet_size")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  About the Airline
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  placeholder="Briefly describe your airline, routes, or services…"
                  className={inputCls("description") + " resize-none"}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Certification ── */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Certifications & Documents
              </h2>
              <p className="text-sm text-slate-400">
                These details help us verify your airline. They won&apos;t be
                shown publicly.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  IATA Membership Number
                </label>
                <input
                  type="text"
                  value={formData.iata_membership_number || ""}
                  onChange={(e) =>
                    update("iata_membership_number", e.target.value)
                  }
                  placeholder="e.g. 17001234"
                  className={inputCls("iata_membership_number")}
                />
              </div>

              {/* Document upload */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Supporting Documents (optional)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-sky-500/50 text-slate-400 hover:text-sky-400 transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">
                    Click to upload AOC, IATA certificate, operating license…
                  </span>
                  <span className="text-xs text-slate-600">
                    Images or PDF, max 10 MB each
                  </span>
                </button>
                {errors.certs && (
                  <p className="text-xs text-red-400 mt-1">{errors.certs}</p>
                )}

                {certs.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {certs.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2"
                      >
                        {c.preview ? (
                          <img
                            src={c.preview}
                            alt={c.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                        ) : (
                          <FileText className="w-10 h-10 text-slate-500 shrink-0" />
                        )}
                        <span className="text-xs text-slate-300 truncate flex-1">
                          {c.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCert(i)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Review & Submit ── */}
          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Review Your Application
              </h2>

              <div className="space-y-3">
                {[
                  { label: "Airline Name", value: formData.airline_name },
                  { label: "IATA Code", value: formData.airline_code },
                  { label: "Email", value: formData.email },
                  { label: "Phone", value: formData.phone || "—" },
                  {
                    label: "HQ City",
                    value: formData.headquarters_city || "—",
                  },
                  {
                    label: "Country",
                    value:
                      COUNTRY_CODES.find(
                        (c) => c.code === formData.headquarters_country,
                      )?.label || "—",
                  },
                  {
                    label: "Fleet Size",
                    value: formData.fleet_size
                      ? String(formData.fleet_size)
                      : "—",
                  },
                  {
                    label: "Documents",
                    value: certs.length ? `${certs.length} file(s)` : "None",
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between py-2 border-b border-white/5 last:border-0"
                  >
                    <span className="text-sm text-slate-400">{row.label}</span>
                    <span className="text-sm text-white font-medium">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                By submitting, you agree to TripC&apos;s partner terms. Your
                application will be reviewed within 2–3 business days, and
                you&apos;ll receive an email notification once approved.
              </p>
            </motion.div>
          )}

          {/* ── Navigation ── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <Link
                href="/partner"
                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Portal
              </Link>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isApplying}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-sky-500 text-white font-semibold text-sm hover:bg-sky-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  useHotelPartnerStore,
  type HotelPartnerApplicationData,
} from "@/store/useHotelPartnerStore";
import { motion } from "framer-motion";
import {
  Hotel,
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

const PROPERTY_TYPES = [
  "Hotel",
  "Resort",
  "Boutique Hotel",
  "Hostel",
  "Villa",
  "Apartment",
  "Guest House",
  "Bed & Breakfast",
  "Motel",
  "Serviced Apartment",
  "Other",
];

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
  { code: "FR", label: "France" },
  { code: "DE", label: "Germany" },
  { code: "AE", label: "UAE" },
];

export function HotelOnboardingForm() {
  const router = useRouter();
  const { user } = useUser();
  const { applyAsPartner, isApplying } = useHotelPartnerStore();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState<HotelPartnerApplicationData>({
    hotel_name: "",
    display_name: "",
    email: "",
    phone: "",
    website: "",
    star_rating: 3,
    property_type: "Hotel",
    room_count: undefined,
    address_line1: "",
    city: "",
    country_code: "VN",
    description: "",
    business_registration_number: "",
    tax_id: "",
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
    field: keyof HotelPartnerApplicationData,
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
    if (!formData.hotel_name.trim()) errs.hotel_name = "Hotel name is required";
    if (!formData.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Invalid email address";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.city?.trim()) errs.city = "City is required";
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
    if (success) router.push("/partner/hotel");
  };

  const inputCls = (field: string) => `
        w-full px-4 py-3 rounded-xl border text-sm transition-colors
        bg-white/5 text-white placeholder:text-slate-500
        ${errors[field]
      ? "border-red-500/50 focus:ring-red-500 focus:border-red-500"
      : "border-white/10 focus:ring-blue-500 focus:border-blue-500"
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
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Hotel className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Hotel Partner Application
          </h1>
          <p className="text-slate-400">
            List your property on TripC Marketplace
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-blue-500" : "bg-white/10"}`}
            />
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          {/* ── Step 1: Business Info ── */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Property Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Hotel / Property Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.hotel_name}
                  onChange={(e) => update("hotel_name", e.target.value)}
                  placeholder="e.g. Grand Ocean Hotel"
                  className={inputCls("hotel_name")}
                />
                {errors.hotel_name && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.hotel_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={formData.display_name || ""}
                  onChange={(e) => update("display_name", e.target.value)}
                  placeholder="Name shown to travellers (defaults to property name)"
                  className={inputCls("display_name")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Business Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="partner@yourhotel.com"
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
                  placeholder="https://yourhotel.com"
                  className={inputCls("website")}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Property Details ── */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">Property Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Property Type
                  </label>
                  <select
                    value={formData.property_type || "Hotel"}
                    onChange={(e) => update("property_type", e.target.value)}
                    className={inputCls("property_type")}
                  >
                    {PROPERTY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Star Rating
                  </label>
                  <select
                    value={formData.star_rating || 3}
                    onChange={(e) =>
                      update("star_rating", Number(e.target.value))
                    }
                    className={inputCls("star_rating")}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <option key={s} value={s}>
                        {s} Star{s > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Number of Rooms
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.room_count || ""}
                  onChange={(e) => update("room_count", Number(e.target.value))}
                  placeholder="e.g. 120"
                  className={inputCls("room_count")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  City <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city || ""}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="e.g. Ho Chi Minh City"
                  className={inputCls("city")}
                />
                {errors.city && (
                  <p className="text-xs text-red-400 mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address_line1 || ""}
                  onChange={(e) => update("address_line1", e.target.value)}
                  placeholder="Street address"
                  className={inputCls("address_line1")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Country
                </label>
                <select
                  value={formData.country_code || "VN"}
                  onChange={(e) => update("country_code", e.target.value)}
                  className={inputCls("country_code")}
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
                  Description
                </label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => update("description", e.target.value)}
                  rows={3}
                  placeholder="Tell travellers about your property…"
                  className={inputCls("description") + " resize-none"}
                />
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Legal & Documents ── */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <h2 className="text-lg font-bold text-white">
                Legal Information
              </h2>
              <p className="text-sm text-slate-400">
                These details help us verify your business. They won&apos;t be
                shown publicly.
              </p>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Business Registration Number
                </label>
                <input
                  type="text"
                  value={formData.business_registration_number || ""}
                  onChange={(e) =>
                    update("business_registration_number", e.target.value)
                  }
                  placeholder="e.g. 0123456789"
                  className={inputCls("business_registration_number")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Tax ID / VAT Number
                </label>
                <input
                  type="text"
                  value={formData.tax_id || ""}
                  onChange={(e) => update("tax_id", e.target.value)}
                  placeholder="e.g. 0123456789"
                  className={inputCls("tax_id")}
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
                  className="w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 transition-colors"
                >
                  <Upload className="w-6 h-6" />
                  <span className="text-sm">
                    Click to upload business license, permits…
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
                  { label: "Hotel Name", value: formData.hotel_name },
                  { label: "Email", value: formData.email },
                  { label: "Phone", value: formData.phone || "—" },
                  {
                    label: "Property Type",
                    value: formData.property_type || "—",
                  },
                  {
                    label: "Star Rating",
                    value: formData.star_rating
                      ? `${formData.star_rating} Stars`
                      : "—",
                  },
                  { label: "City", value: formData.city || "—" },
                  {
                    label: "Country",
                    value:
                      COUNTRY_CODES.find(
                        (c) => c.code === formData.country_code,
                      )?.label ||
                      formData.country_code ||
                      "—",
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
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isApplying}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-500 text-white font-semibold text-sm hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

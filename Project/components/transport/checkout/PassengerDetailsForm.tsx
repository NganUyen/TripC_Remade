import { useState } from "react";
import { Mail, Phone, User, FileText, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface PassengerDetailsFormProps {
    onSubmit: (details: any) => void;
    isSubmitting: boolean;
}

export function PassengerDetailsForm({ onSubmit, isSubmitting }: PassengerDetailsFormProps) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        notes: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                    Who's travelling?
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    We need the primary passenger's details to send the booking confirmation.
                </p>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit}>
                {/* Personal Info Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary/100 transition-colors duration-300"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <User className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personal Information</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="e.g. Alex"
                                type="text"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full px-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                placeholder="e.g. Thompson"
                                type="text"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Info Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/0 group-hover:bg-blue-500 transition-colors duration-300"></div>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                            <Info className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Contact Details</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="alex@example.com"
                                    type="email"
                                />
                            </div>
                            <p className="text-[11px] text-slate-400 ml-1">Your booking confirmation will be sent here.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-14 pr-5 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                    placeholder="+1 (555) 000-0000"
                                    type="tel"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors duration-300"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                            <FileText className="w-5 h-5" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Additional Requests</h3>
                    </div>

                    <div className="space-y-2">
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-5 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-400 min-h-[120px] resize-y"
                            placeholder="Luggage count, child seat, special diet, etc..."
                        ></textarea>
                    </div>
                </div>

                {/* Submit Section */}
                <div className="pt-4 pb-20">
                    <button
                        disabled={isSubmitting}
                        className={cn(
                            "w-full bg-primary text-white py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3",
                            isSubmitting && "opacity-70 cursor-not-allowed"
                        )}
                        type="submit"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Processing Booking...</span>
                            </>
                        ) : (
                            <>
                                <span>Continue to Payment</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-6 text-slate-400">
                        <ShieldCheck className="w-4 h-4" />
                        <p className="text-[11px] uppercase font-bold tracking-widest">
                            Secure 256-bit SSL Encrypted Booking
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
}

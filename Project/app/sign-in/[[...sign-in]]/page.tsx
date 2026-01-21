import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignInPage() {
    return (
        <AuthLayout>
            <SignIn
                appearance={{
                    layout: {
                        socialButtonsVariant: "blockButton",
                        socialButtonsPlacement: "top",
                    },
                    variables: {
                        colorPrimary: "#FF5E1F",
                        colorBackground: "transparent",
                        colorInputBackground: "transparent",
                        colorInputText: "#0f172a",
                        borderRadius: "0.75rem",
                        fontFamily: "var(--font-plus-jakarta), sans-serif",
                    },
                    elements: {
                        rootBox: "w-full",
                        card: "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-8 overflow-hidden",
                        headerTitle: "text-2xl font-bold text-slate-900 dark:text-white mb-2",
                        headerSubtitle: "text-slate-500 dark:text-slate-400 text-sm",
                        socialButtonsBlockButton:
                            "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-200 rounded-xl h-11",
                        socialButtonsBlockButtonText: "font-semibold text-sm",
                        dividerLine: "bg-slate-200 dark:bg-slate-700",
                        dividerText: "text-slate-400 dark:text-slate-500 font-medium text-xs uppercase tracking-wider",
                        formFieldLabel: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
                        formFieldInput:
                            "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#FF5E1F] focus:ring-2 focus:ring-[#FF5E1F]/20 text-slate-900 dark:text-white transition-all shadow-sm h-11",
                        formButtonPrimary:
                            "bg-[#FF5E1F] hover:bg-[#E54810] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 py-3 normal-case",
                        footerActionLink: "text-[#FF5E1F] hover:text-[#E54810] font-bold hover:underline",
                        identityPreviewEditButton: "text-[#FF5E1F] hover:text-[#E54810]",
                        formFieldAction: "text-[#FF5E1F] hover:text-[#E54810] font-semibold text-sm",
                        footer: "-mx-8 -mb-8 px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-transparent flex justify-center",
                        footerActionText: "text-slate-500 dark:text-slate-400"
                    }
                }}
            />
        </AuthLayout>
    );
}

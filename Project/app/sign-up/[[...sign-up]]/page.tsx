import { SignUp } from "@clerk/nextjs";
import { AuthLayout } from "@/components/auth/AuthLayout";

export default function SignUpPage() {
  return (
    <AuthLayout>
      <SignUp
        appearance={{
          layout: {
            socialButtonsVariant: "blockButton",
            socialButtonsPlacement: "top",
          },
          variables: {
            colorPrimary: "#FF5E1F",
            colorBackground: "transparent",
            colorInputBackground: "rgba(255, 255, 255, 0.5)",
            colorInputText: "#0f172a",
            borderRadius: "1rem",
            fontFamily: "var(--font-plus-jakarta), sans-serif",
          },
          elements: {
            rootBox: "w-full",
            card: "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-slate-800 rounded-3xl p-8",
            headerTitle: "text-2xl font-bold text-slate-900 dark:text-white mb-1",
            headerSubtitle: "text-slate-500 dark:text-slate-400 text-sm",
            socialButtonsBlockButton:
              "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 transition-all duration-200 rounded-xl",
            socialButtonsBlockButtonText: "font-semibold text-sm",
            dividerLine: "bg-slate-200 dark:bg-slate-700",
            dividerText: "text-slate-400 dark:text-slate-500 font-medium text-xs uppercase tracking-wider",
            formFieldLabel: "text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1.5",
            formFieldInput:
              "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl focus:border-[#FF5E1F] focus:ring-[#FF5E1F]/20 text-slate-900 dark:text-white transition-all shadow-sm",
            formButtonPrimary:
              "bg-[#FF5E1F] hover:bg-[#E54810] text-white font-bold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 transition-all duration-200 py-3",
            footerActionLink: "text-[#FF5E1F] hover:text-[#E54810] font-bold hover:underline",
            identityPreviewEditButton: "text-[#FF5E1F] hover:text-[#E54810]",
            formFieldAction: "text-[#FF5E1F] hover:text-[#E54810] font-semibold text-sm",
            footer: "hidden"
          }
        }}
      />
    </AuthLayout>
  );
}

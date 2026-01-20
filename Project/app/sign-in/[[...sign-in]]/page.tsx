import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white dark:bg-slate-900 shadow-2xl rounded-2xl",
          },
        }}
      />
    </div>
  );
}

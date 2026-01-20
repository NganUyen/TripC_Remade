import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex items-center justify-center p-4">
      <SignUp
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

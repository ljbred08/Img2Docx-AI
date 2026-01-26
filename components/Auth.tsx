import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function Auth({ onBack }: { onBack?: () => void }) {
    const { signIn } = useAuthActions();
    const [step, setStep] = useState<"signIn" | "signUp">("signIn");
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        const formData = new FormData(event.currentTarget);
        try {
            await signIn("password", formData);
        } catch (e) {
            console.error(e);
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-100 relative">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        ← Back
                    </button>
                )}
                <div>
                    <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
                        {step === "signIn" ? "Welcome Back" : "Create your account"}
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        {step === "signIn" ? (
                            <>
                                Don&apos;t have an account?{" "}
                                <button
                                    onClick={() => setStep("signUp")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{" "}
                                <button
                                    onClick={() => setStep("signIn")}
                                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <input name="flow" type="hidden" value={step} />
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="relative block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="relative block w-full rounded-lg border-0 py-2.5 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all shadow-sm"
                        >
                            {step === "signIn" ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </form>

                <div className="relative mt-10">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm font-medium leading-6">
                        <span className="bg-white px-6 text-slate-400">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google")}
                        className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors"
                    >
                        <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                            <path
                                d="M12.48 10.92V14.71H17.89C17.65 16.14 16.59 18.23 14.54 19.64L14.52 19.78L17.55 22.13L17.76 22.15C19.69 20.37 20.8 17.73 20.8 14.59C20.8 14.1 20.75 13.56 20.66 13.04L20.64 12.92H12.48Z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12.48 10.92H4.44V14.71H7.8C7.31 16.27 6.22 17.5 4.77 18.26V21.14H7.82C9.62 19.46 10.66 17.01 10.66 14.22C10.66 13.51 10.59 12.87 10.46 12.28L10.43 12.16H12.48V10.92Z"
                                fill="#34A853"
                            />
                            <path
                                d="M4.33 13.92C4.12 13.29 4 12.63 4 11.94C4 11.25 4.12 10.59 4.33 9.96V7.08H1.28C0.47 8.56 0 10.23 0 12C0 13.77 0.47 15.44 1.28 16.92L4.33 13.92Z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12.48 4.67C13.88 4.67 14.93 5.27 15.46 5.76L18.3 2.97C16.5 1.28 14.11 0.25 11.69 0.25C7.23 0.25 3.4 2.8 1.28 6.54L4.33 9.42C5.07 7.42 7.02 5.92 9.38 5.92C10.45 5.92 11.45 6.22 12.23 6.77L12.48 4.67Z"
                                fill="#EA4335"
                            />
                        </svg>
                        Google
                    </button>
                </div>
            </div>
        </div>
    );
}

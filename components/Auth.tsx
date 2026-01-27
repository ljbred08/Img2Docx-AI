import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function Auth({ onBack, message }: { onBack?: () => void; message?: string | null }) {
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
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative">
                <div className="relative">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="mb-4 text-slate-400 hover:text-slate-600 transition-colors text-sm font-medium flex items-center gap-1"
                        >
                            ← Back
                        </button>
                    )}

                    {message && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium text-center mb-6">
                            {message}
                        </div>
                    )}

                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
                            {step === "signIn" ? "Welcome Back" : "Create your account"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            {step === "signIn" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        onClick={() => setStep("signUp")}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        onClick={() => setStep("signIn")}
                                        className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Sign in
                                    </button>
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                    <input name="flow" type="hidden" value={step} />
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="block w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="block w-full border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 sm:text-sm transition-all bg-slate-50 focus:bg-white outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            className="group relative flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all shadow-md active:scale-[0.98]"
                        >
                            {step === "signIn" ? "Sign in" : "Sign up"}
                        </button>
                    </div>
                </form>

                <div className="relative mt-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-slate-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs font-medium uppercase tracking-widest text-slate-400">
                        <span className="bg-white px-4">Or continue with</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => signIn("google")}
                        className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:ring-slate-300 transition-all active:scale-[0.98]"
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.83c.87-2.6 3.3-4.51 6.16-4.51z"
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

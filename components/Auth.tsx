import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";

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
        <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md border-border/50 shadow-xl overflow-hidden rounded-2xl bg-card relative">
                {onBack && (
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="absolute left-4 top-6 h-8 px-2 text-muted-foreground hover:text-foreground z-10"
                    >
                        <ChevronLeft size={16} className="mr-1" />
                        Back
                    </Button>
                )}

                <CardHeader className="space-y-1 pt-16 pb-4">
                    <CardTitle className="text-2xl font-extrabold tracking-tight text-center">
                        {step === "signIn" ? "Welcome Back" : "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-center text-sm text-muted-foreground">
                        {step === "signIn"
                            ? "Enter your credentials to access your documents"
                            : "Start your professional document OCR journey"}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-8 pb-0">
                    {message && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium text-center mb-4">
                            {message}
                        </div>
                    )}

                    <Tabs value={step} onValueChange={(v) => setStep(v as any)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted p-1 rounded-lg">
                            <TabsTrigger value="signIn" className="rounded-md">Sign In</TabsTrigger>
                            <TabsTrigger value="signUp" className="rounded-md">Sign Up</TabsTrigger>
                        </TabsList>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input name="flow" type="hidden" value={step} />
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="rounded-xl h-11 bg-muted/30 border-muted focus:bg-background transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    className="rounded-xl h-11 bg-muted/30 border-muted focus:bg-background transition-all"
                                />
                            </div>

                            {error && (
                                <div className="text-destructive text-sm text-center font-medium bg-destructive/5 py-2 rounded-lg border border-destructive/10 animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full h-11 text-base font-semibold rounded-xl transition-transform active:scale-[0.98]">
                                {step === "signIn" ? "Sign In" : "Create Account"}
                            </Button>
                        </form>
                    </Tabs>
                </CardContent>

                <div className="relative py-2 px-8">
                    <div className="absolute inset-0 flex items-center px-8">
                        <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
                        <span className="bg-card px-3 text-muted-foreground/60 font-bold">
                            Or continue with
                        </span>
                    </div>
                </div>

                <CardFooter className="px-8 pb-10">
                    <Button
                        variant="outline"
                        onClick={() => signIn("google")}
                        className="w-full h-11 rounded-xl font-semibold gap-3 hover:bg-muted/50 transition-all active:scale-[0.98]"
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
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}

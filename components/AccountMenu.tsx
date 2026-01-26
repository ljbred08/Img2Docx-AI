import React, { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { User, LogOut, Settings, CreditCard, ChevronDown, LogIn } from "lucide-react";

interface AccountMenuProps {
    onSignInClick: () => void;
}

export function AccountMenu({ onSignInClick }: AccountMenuProps) {
    const { signOut } = useAuthActions();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) return null;

    if (!isAuthenticated) {
        return (
            <button
                onClick={onSignInClick}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm border border-indigo-700"
            >
                <LogIn size={16} />
                <span>Sign In</span>
            </button>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
                <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <User size={16} />
                </div>
                <span className="hidden sm:inline">Account</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white p-2 shadow-2xl ring-1 ring-slate-200 focus:outline-none z-20">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Management
                        </div>
                        <button
                            onClick={() => { }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Settings size={16} className="text-slate-400" />
                            Settings
                        </button>
                        <button
                            onClick={() => { }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <CreditCard size={16} className="text-slate-400" />
                            Subscription
                        </button>
                        <div className="my-1 border-t border-slate-100"></div>
                        <button
                            onClick={() => {
                                void signOut();
                                setIsOpen(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

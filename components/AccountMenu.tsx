import React from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { User, LogOut, Settings, CreditCard, ChevronDown, LogIn } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface AccountMenuProps {
    onSignInClick: () => void;
    showSignInButton?: boolean;
}

export function AccountMenu({ onSignInClick, showSignInButton = true }: AccountMenuProps) {
    const { signOut } = useAuthActions();
    const { isAuthenticated, isLoading } = useConvexAuth();
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    if (isLoading) return null;

    if (!isAuthenticated) {
        if (!showSignInButton) return null;
        return (
            <Button
                onClick={onSignInClick}
                className="gap-2 rounded-full font-semibold shadow-sm border border-primary/20"
            >
                <LogIn size={16} />
                <span>Sign In</span>
            </Button>
        );
    }

    return (
        <DropdownMenu
            onOpenChange={(open) => {
                if (!open && buttonRef.current) {
                    buttonRef.current.blur();
                }
            }}
        >
            <DropdownMenuTrigger asChild>
                <Button
                    ref={buttonRef}
                    variant="ghost"
                    className="gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
                >
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={16} />
                    </div>
                    <span className="hidden sm:inline">Account</span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Management
                </DropdownMenuLabel>
                <DropdownMenuItem>
                    <Settings />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <CreditCard />
                    Subscription
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => void signOut()}>
                    <LogOut />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

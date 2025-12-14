'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, HelpCircle, Building2, Users, Gift, LogIn, UserPlus, User, Settings, LogOut, MessageSquare, Calendar, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export function UserMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated, user, logout } = useAuth();

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        function handleEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') setIsOpen(false);
        }
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            {/* Menu Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-full border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 transition-all"
                aria-label="User menu"
                aria-expanded={isOpen}
            >
                <Menu className="h-4 w-4 text-white/70" />
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                    {isAuthenticated && user?.firstName ? (
                        <span className="text-xs font-medium text-white">
                            {user.firstName.charAt(0).toUpperCase()}
                        </span>
                    ) : (
                        <User className="h-4 w-4 text-white" />
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 py-2 bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl shadow-black/50 animate-fade-in z-[100]">
                    {isAuthenticated ? (
                        <>
                            {/* User Info */}
                            <div className="px-4 py-3 border-b border-white/10">
                                <p className="text-sm font-medium text-white">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-white/50">{user?.email}</p>
                            </div>

                            {/* Authenticated Links */}
                            <div className="py-2">
                                <MenuLink href="/dashboard" icon={User} onClick={() => setIsOpen(false)}>
                                    Dashboard
                                </MenuLink>
                                <MenuLink href="/messages" icon={MessageSquare} onClick={() => setIsOpen(false)}>
                                    Messages
                                </MenuLink>
                                <MenuLink href="/dashboard?tab=appointments" icon={Calendar} onClick={() => setIsOpen(false)}>
                                    Appointments
                                </MenuLink>
                                <MenuLink href="/dashboard?tab=favorites" icon={Heart} onClick={() => setIsOpen(false)}>
                                    Saved
                                </MenuLink>
                            </div>

                            <div className="border-t border-white/10 py-2">
                                <MenuLink href="/business/register" icon={Building2} onClick={() => setIsOpen(false)}>
                                    List your business
                                </MenuLink>
                                <MenuLink href="/settings" icon={Settings} onClick={() => setIsOpen(false)}>
                                    Settings
                                </MenuLink>
                            </div>

                            <div className="border-t border-white/10 py-2">
                                <MenuLink href="/help" icon={HelpCircle} onClick={() => setIsOpen(false)}>
                                    Help Center
                                </MenuLink>
                            </div>

                            <div className="border-t border-white/10 pt-2">
                                <button
                                    onClick={() => {
                                        logout();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Log out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Guest Links - Primary Actions */}
                            <div className="py-2">
                                <MenuLink href="/auth/signup" icon={UserPlus} onClick={() => setIsOpen(false)} highlight>
                                    Sign up
                                </MenuLink>
                                <MenuLink href="/auth/login" icon={LogIn} onClick={() => setIsOpen(false)}>
                                    Log in
                                </MenuLink>
                            </div>

                            <div className="border-t border-white/10 py-2">
                                <MenuLink href="/help" icon={HelpCircle} onClick={() => setIsOpen(false)}>
                                    Help Center
                                </MenuLink>
                            </div>

                            <div className="border-t border-white/10 py-2">
                                <MenuLink href="/business/register" icon={Building2} onClick={() => setIsOpen(false)}>
                                    List your business
                                    <span className="ml-auto text-xs text-white/40">It's easy</span>
                                </MenuLink>
                                <MenuLink href="/referral" icon={Users} onClick={() => setIsOpen(false)}>
                                    Refer a friend
                                </MenuLink>
                                <MenuLink href="/gift-cards" icon={Gift} onClick={() => setIsOpen(false)}>
                                    Gift cards
                                </MenuLink>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// Menu Link Component
interface MenuLinkProps {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    onClick?: () => void;
    highlight?: boolean;
}

function MenuLink({ href, icon: Icon, children, onClick, highlight }: MenuLinkProps) {
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onClick) onClick();
        router.push(href);
    };

    return (
        <button
            onClick={handleClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${highlight
                ? 'text-white font-medium hover:bg-white/5'
                : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className="h-4 w-4" />
            {children}
        </button>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LoggedOutHeaderProps {
    redirectTo?: string;
}

const LoggedOutHeader: React.FC<LoggedOutHeaderProps> = ({ redirectTo }) => {
    const navigate = useNavigate();

    const handleLogin = () => {
        const loginPath = redirectTo ? `/login?redirectTo=${encodeURIComponent(redirectTo)}` : '/login';
        navigate(loginPath);
    };

    const handleSignUp = () => {
        const onboardingPath = redirectTo ? `/onboarding?redirectTo=${encodeURIComponent(redirectTo)}` : '/onboarding';
        navigate(onboardingPath);
    };

    return (
        <header className="sticky top-0 z-50 w-full flex items-center justify-between px-4 md:px-6 py-4 md:py-3 border-b-2 border-gray-200 bg-gray-50">
            {/* Logo */}
            <div
                className="cursor-pointer flex items-center flex-shrink-0"
                onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    navigate('/');
                }}
            >
                <img
                    src="/icons/FullLogo.png"
                    alt="CRWD Logo"
                    className="w-20 md:w-[100px] h-auto object-contain"
                />
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 md:gap-6">
                <button
                    onClick={handleLogin}
                    className="text-sm md:text-base font-bold text-gray-900 hover:opacity-70 transition-opacity whitespace-nowrap"
                >
                    Log In
                </button>
                <button
                    onClick={handleSignUp}
                    className="bg-[#FF3366] hover:bg-[#FF0033] text-white px-4 md:px-6 py-1.5 md:py-2 rounded-full text-sm md:text-base font-bold transition-all whitespace-nowrap active:scale-95 shadow-sm"
                >
                    Sign Up
                </button>
            </div>
        </header>
    );
};

export default LoggedOutHeader;

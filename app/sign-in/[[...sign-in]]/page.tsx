'use client';

import { useSignIn } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signIn, isLoading, setActive } = useSignIn();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;
        
        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push('/');
            }
        } catch (err: any) {
            console.error("Error during sign in:", err.errors ? err.errors[0].message : err);
        }
    };

    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode) return;

        try {
            const verification = await signIn.attemptFirstFactor({
                strategy: "email_code",
                code: verifyCode,
            });

            if (verification.status === "complete") {
                await setActive({ session: verification.createdSessionId });
                window.location.href = "/"; // Redirect to home after successful verification
            }
        } catch (err: any) {
            console.error("Error verifying code:", err.errors ? err.errors[0].message : err);
        }
    };const handleEmailSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        
        try {
            await signIn.create({
                identifier: email,
                strategy: "email_code",
            });

            // Start the email code verification flow
            const startEmailCodeFactor = await signIn.prepareFirstFactor({
                strategy: "email_code",
                emailAddressId: signIn.supportedFirstFactors.find(
                    factor => factor.strategy === "email_code"
                )?.safeIdentifier!
            });

            // Prepare the verification
            if (startEmailCodeFactor) {
                console.log("Verification code sent to email");
            }
        } catch (err: any) {
            console.error("Error during sign in:", err.errors ? err.errors[0].message : err);
        }
    };
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-[400px] rounded-3xl border-2 p-8 shadow-sm">
                <div className="mb-8 flex justify-center">
                    <Image 
                        src="/images/logo.svg" 
                        alt="Converso" 
                        width={50} 
                        height={50}
                    />
                </div>

                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold">Sign in to Converso</h1>
                    <p className="text-sm text-gray-600">Welcome back! Please sign in to continue</p>
                </div>

                <div className="space-y-4">                    <button 
                        onClick={() => signIn.authenticateWithRedirect({
                            strategy: "oauth_google",
                            redirectUrl: "/",
                            redirectUrlComplete: "/"
                        })}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 hover:bg-gray-50"
                    >
                        <Image 
                            src="/icons/google.svg" 
                            alt="Google" 
                            width={20} 
                            height={20} 
                        />
                        Continue with Google
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-white px-2 text-gray-500">or</span>
                        </div>
                    </div>                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm text-gray-600">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm text-gray-600">
                                    Password
                                </label>
                                <input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full rounded-lg bg-[#ff5733] py-3 text-white hover:bg-[#ff5733]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Loading...' : 'Continue'}
                            </button>
                        </div>
                    </form>

                    <p className="text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/sign-up" className="text-[#ff5733] hover:underline">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
'use client';

import { useSignUp } from '@clerk/nextjs';
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [pendingVerification, setPendingVerification] = useState(false);
    const { signUp, setActive } = useSignUp();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Basic validation
        if (!email || !password) {
            setError('Please fill in all required fields');
            return;
        }

        if (!signUp) {
            setError('Sign up is not initialized');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await signUp.create({
                emailAddress: email,
                password: password
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push('/');
                return;
            }

            // Handle email verification
            if (result.status === "missing_requirements") {
                const missingFields = result.missingFields;
                console.log('Missing requirements:', missingFields);
                
                if (missingFields.includes("emailAddress" as any)) {
                    setError('Please enter a valid email address');
                } else if (missingFields.includes("password")) {
                    setError('Please enter a valid password');
                } else {
                    // Prepare for email verification
                    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
                    setPendingVerification(true);
                    setError('Please check your email for a verification code.');
                }
            }

        } catch (err: any) {
            console.error("Error during sign up:", err);
            if (err.errors?.[0]?.message?.includes('email already exists')) {
                setError('This email address is already taken. Please try another one.');
            } else if (err.errors?.[0]?.message) {
                setError(err.errors[0].message);
            } else {
                setError('An error occurred during sign up. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code) {
            setError('Please enter the verification code');
            return;
        }

        try {
            setIsLoading(true);
            const result = await signUp?.attemptEmailAddressVerification({
                code,
            });
            
            if (result?.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/");
            } else {
                setError("Error verifying email. Please try again.");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Error verifying email");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-[460px] rounded-3xl border-2 p-8 shadow-sm">
                <div className="mb-8 flex justify-center">
                    <Image 
                        src="/images/logo.svg" 
                        alt="Converso" 
                        width={50} 
                        height={50}
                    />
                </div>

                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-2xl font-bold">Create your account</h1>
                    <p className="text-sm text-gray-600">Join Converso and start learning with AI companions</p>
                </div>

                <div className="space-y-4">
                    {!pendingVerification ? (
                        <>
                            <button
                                onClick={() => signUp?.authenticateWithRedirect({
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
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm text-gray-600">
                                        Email Address
                                    </label>
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => {
                                            setError('');
                                            setEmail(e.target.value);
                                        }}
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
                                        onChange={(e) => {
                                            setError('');
                                            setPassword(e.target.value);
                                        }}
                                        className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                                        placeholder="Create a password"
                                        required
                                    />
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isLoading || !email || !password}
                                    className="w-full rounded-lg bg-[#ff5733] py-3 text-white hover:bg-[#ff5733]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? 'Creating account...' : 'Sign up'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <form onSubmit={verifyEmail} className="space-y-4">
                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-500">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label className="mb-2 block text-sm text-gray-600">
                                    Verification Code
                                </label>
                                <input 
                                    type="text"
                                    value={code}
                                    onChange={(e) => {
                                        setError('');
                                        setCode(e.target.value);
                                    }}
                                    className="w-full rounded-lg border p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="Enter verification code"
                                    required
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={isLoading || !code}
                                className="w-full rounded-lg bg-[#ff5733] py-3 text-white hover:bg-[#ff5733]/90 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="text-[#ff5733] hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
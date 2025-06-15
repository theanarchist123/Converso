'use client';

import Link from "next/link";
import Image from "next/image";

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image 
                        src="/images/logo.svg" 
                        alt="Converso Logo" 
                        width={46} 
                        height={44}
                    />
                    <span className="ml-2 text-2xl font-bold text-primary">Converso</span>
                </div>
                <Link href="/sign-in" className="btn-primary px-6 py-2 text-lg">
                    Get Started
                </Link>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col items-center justify-center flex-1 text-center px-4">
                <h1 className="text-5xl font-extrabold mb-6 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                    Learn Faster with AI Companions
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
                    Experience personalized learning with Converso. Build your own AI companions, chat naturally, and master any subject with interactive, engaging conversations.
                </p>
                <Link href="/sign-in" className="btn-primary text-lg px-8 py-4 rounded-xl shadow-md">
                    Get Started
                </Link>
                <div className="mt-12 flex flex-col items-center gap-6">
                    <div className="flex flex-wrap gap-8 justify-center">
                        <div className="bg-white rounded-2xl shadow p-6 w-72 border border-black">
                            <Image src="/icons/language.svg" alt="AI Companions" width={40} height={40} className="mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">Build Your Own AI Companions</h3>
                            <p className="text-gray-600">Pick a subject, style, and voice. Your learning, your way.</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-6 w-72 border border-black">
                            <Image src="/icons/clock.svg" alt="Track Progress" width={40} height={40} className="mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">Track Your Progress</h3>
                            <p className="text-gray-600">See your recent sessions, achievements, and learning journey.</p>
                        </div>
                        <div className="bg-white rounded-2xl shadow p-6 w-72 border border-black">
                            <Image src="/icons/coding.svg" alt="Interactive Learning" width={40} height={40} className="mb-4 mx-auto" />
                            <h3 className="text-xl font-semibold mb-2">Interactive & Fun</h3>
                            <p className="text-gray-600">Converse, ask questions, and get instant feedback from your AI tutor.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="mt-16 py-8 border-t bg-white text-center text-gray-500">
                &copy; {new Date().getFullYear()} Converso. All rights reserved.
            </footer>
        </div>
    );
}



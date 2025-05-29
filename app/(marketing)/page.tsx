'use client';

import Link from "next/link";
import Image from "next/image";

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Navigation */}
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Image 
                            src="/images/logo.svg" 
                            alt="Logo" 
                            width={40} 
                            height={40}
                        />
                        <span className="ml-2 text-xl font-bold text-primary">LearnMate</span>
                    </div>
                    <Link 
                        href="/app" 
                        className="btn-primary"
                    >
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="container mx-auto px-6 py-16 text-center">
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-violet-600 bg-clip-text text-transparent">
                    Learn Faster with AI Companions
                </h1>
                <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                    Experience personalized learning with our AI companions. Master any subject with interactive, engaging conversations.
                </p>
                <div className="flex justify-center gap-4">
                    <Link 
                        href="/app" 
                        className="btn-primary text-lg px-8 py-4"
                    >
                        Start Learning Now
                    </Link>
                    <Link 
                        href="/companions" 
                        className="btn-secondary text-lg px-8 py-4"
                    >
                        Browse Companions
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-6 py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Image 
                                src="/icons/check.svg" 
                                alt="Personalized" 
                                width={24} 
                                height={24}
                            />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
                        <p className="text-gray-600">AI companions adapt to your learning style and pace</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Image 
                                src="/icons/coding.svg" 
                                alt="Interactive" 
                                width={24} 
                                height={24}
                            />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Interactive Sessions</h3>
                        <p className="text-gray-600">Engage in natural conversations to enhance understanding</p>
                    </div>
                    
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Image 
                                src="/icons/history.svg" 
                                alt="Track Progress" 
                                width={24} 
                                height={24}
                            />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
                        <p className="text-gray-600">Monitor your learning journey and achievements</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-6 py-16 text-center">
                <div className="bg-primary/10 rounded-2xl p-12">
                    <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Learning?</h2>
                    <p className="text-xl text-gray-600 mb-8">
                        Join thousands of learners who are already experiencing the future of education.
                    </p>
                    <Link 
                        href="/app" 
                        className="btn-primary text-lg px-8 py-4"
                    >
                        Get Started For Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 border-t">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Image 
                            src="/images/logo.svg" 
                            alt="Logo" 
                            width={30} 
                            height={30}
                        />
                        <span className="ml-2 text-gray-600">© 2025 LearnMate. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};



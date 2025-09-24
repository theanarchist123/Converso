import Link from "next/link";
import Image from "next/image";

export default function MarketingPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Navigation */}
            <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200/50 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-lg">C</span>
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Converso
                        </span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Features</a>
                        <a href="#demo" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Demo</a>
                        <a href="#pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Pricing</a>
                    </div>
                    <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm border border-blue-200/50 rounded-full px-4 py-2 mb-8">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-gray-700">AI-Powered Learning Platform</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Learn Faster
                            </span>
                            <br />
                            <span className="text-gray-800">with AI Companions</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                            Experience the future of personalized education. Create your own AI tutors, master any subject, and track your progress with our revolutionary learning platform.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                            <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl">
                                Start Learning Now
                            </Link>
                            <button className="bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105">
                                Watch Demo
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-blue-600">1,234+</span>
                                <span>Active Learners</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-purple-600">567+</span>
                                <span>AI Companions</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-indigo-600">98%</span>
                                <span>Success Rate</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white/50 backdrop-blur-sm">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Why Choose Converso?
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Experience learning like never before with our cutting-edge AI technology and personalized approach.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {/* Feature 1 */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-blue-300/50 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">AI-Powered Companions</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Create personalized AI tutors for any subject. Each companion adapts to your learning style and provides instant, contextual feedback.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-purple-300/50 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">Smart Progress Tracking</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Visualize your learning journey with detailed analytics, achievement badges, and personalized recommendations for improvement.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-200/50 hover:border-indigo-300/50 transform hover:-translate-y-2">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-800">Interactive Conversations</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Engage in natural, dynamic conversations with your AI companions. Ask questions, get explanations, and explore topics at your own pace.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Additional Features Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
                            <div className="text-3xl mb-3">🔒</div>
                            <h4 className="font-semibold mb-2">Privacy First</h4>
                            <p className="text-sm text-gray-600">Your data stays private and secure</p>
                        </div>
                        <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
                            <div className="text-3xl mb-3">📱</div>
                            <h4 className="font-semibold mb-2">Mobile Ready</h4>
                            <p className="text-sm text-gray-600">Learn anywhere, anytime</p>
                        </div>
                        <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
                            <div className="text-3xl mb-3">⚡</div>
                            <h4 className="font-semibold mb-2">Lightning Fast</h4>
                            <p className="text-sm text-gray-600">Instant responses and feedback</p>
                        </div>
                        <div className="text-center p-6 bg-white/60 rounded-xl backdrop-blur-sm">
                            <div className="text-3xl mb-3">🎯</div>
                            <h4 className="font-semibold mb-2">Personalized</h4>
                            <p className="text-sm text-gray-600">Tailored to your learning style</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Demo Section */}
            <section id="demo" className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                            See Converso in Action
                        </h2>
                        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
                            Watch how our AI companions transform the learning experience with personalized, interactive education.
                        </p>
                        
                        <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="aspect-video bg-white/20 rounded-xl flex items-center justify-center mb-8">
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                    <p className="text-white font-medium">Click to watch demo video</p>
                                </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-6 text-white">
                                <div className="text-center">
                                    <div className="text-3xl font-bold">2 min</div>
                                    <div className="text-blue-200">Setup Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">∞</div>
                                    <div className="text-blue-200">Learning Possibilities</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold">24/7</div>
                                    <div className="text-blue-200">AI Availability</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-white/50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                            Choose Your Learning Path
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Start free and upgrade as you grow. All plans include our core AI features.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Free Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-4">Beginner</h3>
                                <div className="text-4xl font-bold mb-2">$0</div>
                                <div className="text-gray-500">Forever free</div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    2 AI Companions
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Basic progress tracking
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Community support
                                </li>
                            </ul>
                            <Link href="/sign-in" className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-3 rounded-xl font-semibold transition-colors">
                                Get Started
                            </Link>
                        </div>

                        {/* Pro Plan */}
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 shadow-xl transform hover:scale-105 transition-transform duration-300 relative">
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-800 px-4 py-1 rounded-full text-sm font-semibold">
                                Most Popular
                            </div>
                            <div className="text-center mb-8 text-white">
                                <h3 className="text-2xl font-bold mb-4">Core Learner</h3>
                                <div className="text-4xl font-bold mb-2">$19</div>
                                <div className="text-blue-100">per month</div>
                            </div>
                            <ul className="space-y-4 mb-8 text-white">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    10 AI Companions
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Advanced analytics
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Priority support
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-yellow-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Custom learning paths
                                </li>
                            </ul>
                            <Link href="/sign-in" className="block w-full bg-white text-blue-600 text-center py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* Enterprise Plan */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200 transform hover:scale-105 transition-transform duration-300">
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                                <div className="text-4xl font-bold mb-2">$49</div>
                                <div className="text-gray-500">per month</div>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Unlimited companions
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Advanced AI models
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    White-label options
                                </li>
                                <li className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                    </svg>
                                    Dedicated support
                                </li>
                            </ul>
                            <Link href="/sign-in" className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-center py-3 rounded-xl font-semibold transition-all">
                                Contact Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 bg-gradient-to-r from-gray-900 to-gray-800">
                <div className="container mx-auto px-6 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                            Ready to Transform Your Learning?
                        </h2>
                        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                            Join thousands of learners who are already experiencing the future of education with Converso.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/sign-in" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                                Start Your Journey
                            </Link>
                            <button className="bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 border-t border-gray-800 py-12">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold">C</span>
                                </div>
                                <span className="text-xl font-bold text-white">Converso</span>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Revolutionizing education with AI-powered personalized learning experiences.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Converso. All rights reserved. Built with ❤️ for learners everywhere.
                    </div>
                </div>
            </footer>
        </div>
    );
}

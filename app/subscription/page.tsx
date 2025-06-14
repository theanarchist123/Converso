import React from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const plans = [
    {
        name: "Basic plan",
        price: "$0/mnt",
        description: "Perfect for testing the waters.",
        icon: "/icons/cap.svg",
        color: "bg-[#e9d5ff]",
        features: [
            { text: "10 Conversations/month", included: true },
            { text: "3 Active Companion", included: true },
            { text: "Basic Session Recaps", included: true },
            { text: "Monthly Progress Reports", included: false },
            { text: "Save Conversation History", included: false },
            { text: "Full Performance Dashboards", included: false },
        ],
        buttonText: "Get Started Free",
        buttonClass: "bg-[#ff5733] hover:bg-[#ff5733]/90"
    },
    {
        name: "Core Learner",
        price: "$12/mnt",
        description: "More Companions. More growth.",
        icon: "/icons/language.svg",        color: "bg-[#fef08a]",
        popular: true,
        features: [
            { text: "Everything in Free", included: true },
            { text: "Unlimited Conversations", included: true },
            { text: "Up to 10 Active Companions", included: true },
            { text: "Save Conversation History", included: true },
            { text: "Inline Quizzes & Recaps", included: true },
            { text: "Monthly Progress Reports", included: true },
        ],
        buttonText: "Upgrade to Core",
        buttonClass: "bg-[#ff5733] hover:bg-[#ff5733]/90"
    },
    {
        name: "Pro Companion",
        price: "$29/mnt",
        description: "Your personal AI-powered academy.",
        icon: "/icons/coding.svg",        color: "bg-[#bae6fd]",
        features: [
            { text: "Everything in Core", included: true },
            { text: "Unlimited Companions", included: true },
            { text: "Full Performance Dashboards", included: true },
            { text: "Daily Learning Reminders", included: true },
            { text: "Early Access to New Features", included: true },
            { text: "Priority Support", included: true },
        ],
        buttonText: "Upgrade to Pro",
        buttonClass: "bg-[#ff5733] hover:bg-[#ff5733]/90"
    }
]

const Subscription = () => {
    return (
        <main className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">Choose Your Learning Journey</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Start free, upgrade anytime. Unlock smarter Conversations, deeper insights, and unlimited potential with a plan that fits your goals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {plans.map((plan, index) => (
                    <div key={index} className={cn(
                        "rounded-2xl p-10 relative border-2 border-black min-w-[340px] max-w-[420px] mx-auto",
                        plan.color
                    )}>
                        {plan.popular && (
                            <div className="absolute -top-3 right-8">
                                <div className="bg-[#ff5733] text-white px-4 py-1 rounded-full text-sm">
                                    Most popular!
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-center mb-4">
                            <div className="rounded-xl p-3">
                                <Image src={plan.icon} alt={plan.name} width={35} height={35} />
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                            <div className="text-4xl font-extrabold mb-2">{plan.price}</div>
                            <p className="text-gray-600 text-base">{plan.description}</p>
                        </div>

                        <div className="space-y-4 mb-6">
                            {plan.features.map((feature, featureIndex) => (
                                <div key={featureIndex} className="flex items-center">
                                    {feature.included ? (
                                        <Image src="/icons/check.svg" alt="Included" width={20} height={20} className="mr-2" />
                                    ) : (
                                        <span className="text-red-500 mr-2">✕</span>
                                    )}
                                    <span className="text-sm">{feature.text}</span>
                                </div>
                            ))}
                        </div>

                        <button className={cn(
                            "w-full rounded-lg py-3 text-white font-medium transition-colors",
                            plan.buttonClass
                        )}>
                            {plan.buttonText}
                        </button>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default Subscription

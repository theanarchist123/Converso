import { currentUser } from "@clerk/nextjs/server";
import CompanionCard from "@/components/CompanionCard";
import CompanionsList from "@/components/CompanionList";
import CTA from "@/components/CTA";
import HomeHeroBanner from "@/components/HomeHeroBanner";
import { getAllCompanions, getRecentSessions, getUserCompanions } from "@/lib/actions/companion.actions";
import { getSubjectColor } from "@/lib/utils";
import Link from "next/link";

// Force dynamic rendering since this page uses headers (via Clerk auth)
export const dynamic = 'force-dynamic';

export default async function Page() {
    const user = await currentUser();
    const companions = await getAllCompanions({ limit: 3 });
    const recentSessionsCompanions = await getRecentSessions(10);
    const userCompanions = user ? await getUserCompanions(user.id) : [];

    // Stats for hero
    const sessionCount = recentSessionsCompanions.length;
    const companionCount = userCompanions.length;
    const subjectCount = new Set(userCompanions.map((c: { subject?: string }) => c.subject)).size;

    return (
        <main className="flex flex-col gap-10 pb-16">
            {/* ── Hero Banner ─────────────────────────────────────────── */}
            <HomeHeroBanner
                firstName={user?.firstName}
                sessionCount={sessionCount}
                companionCount={companionCount}
                subjectCount={subjectCount}
            />

            {/* ── Popular Companions ───────────────────────────────────── */}
            <section className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-8 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                            <svg className="size-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-2xl text-foreground">Popular Companions</h2>
                    </div>
                    <Link
                        href="/companions"
                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                        View all
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                        </svg>
                    </Link>
                </div>

                <section className="companions-grid">
                    {companions.map((companion) => (
                        <CompanionCard
                            key={companion.id}
                            {...companion}
                            color={getSubjectColor(companion.subject)}
                        />
                    ))}
                </section>
            </section>

            {/* ── Sessions + CTA ───────────────────────────────────────── */}
            <section className="home-section">
                <CompanionsList
                    title="Recently completed sessions"
                    companions={recentSessionsCompanions}
                    classNames="w-2/3 max-lg:w-full"
                />
                <CTA />
            </section>
        </main>
    )
}

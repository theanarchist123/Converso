import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
    getUserCompanions,
    getUserSessions,
    getBookmarkedCompanions,
} from "@/lib/actions/companion.actions";
import Image from "next/image";
import LearningLogForm from "@/components/LearningLogForm";
import LearningLogDisplay from "@/components/LearningLogDisplay";
import JourneyTabs from "@/components/JourneyTabs";

const Profile = async () => {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    const companions = await getUserCompanions(user.id);
    const sessionHistory = await getUserSessions(user.id);
    const bookmarkedCompanions = await getBookmarkedCompanions(user.id);

    // Stats summary
    const uniqueSubjects = new Set(companions.map((c: { subject?: string }) => c.subject)).size;

    const stats = [
        {
            icon: (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            value: sessionHistory.length,
            label: "Lessons Completed",
        },
        {
            icon: (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 14l6.16-3.422A12.083 12.083 0 0121 18.5a12.083 12.083 0 01-9 3.5 12.083 12.083 0 01-9-3.5 12.083 12.083 0 012.84-7.922L12 14z" />
                </svg>
            ),
            value: companions.length,
            label: "Companions Created",
        },
        {
            icon: (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            value: uniqueSubjects,
            label: "Subjects Explored",
        },
        {
            icon: (
                <svg className="size-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
            ),
            value: bookmarkedCompanions.length,
            label: "Bookmarked",
        },
    ];

    return (
        <main className="min-lg:w-3/4 space-y-5">

            {/* ── Hero Section ─────────────────────────────────────── */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-10">
                {/* Decorative gradient blobs */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -top-24 -right-24 size-72 rounded-full bg-primary/10 blur-3xl" />
                    <div className="absolute -bottom-16 -left-16 size-56 rounded-full bg-primary/5 blur-2xl" />
                </div>

                <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="journey-avatar-ring p-1.5">
                            <Image
                                src={user.imageUrl}
                                alt={user.firstName!}
                                width={96}
                                height={96}
                                className="rounded-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Name + email + bio */}
                    <div className="flex flex-col gap-1.5 text-center sm:text-left">
                        <div className="flex items-center gap-2 justify-center sm:justify-start">
                            <h1 className="font-bold text-2xl text-foreground">
                                {user.firstName} {user.lastName}
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                                ✦ Learner
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {user.emailAddresses[0].emailAddress}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                            Tracking your growth, one session at a time.
                        </p>
                    </div>
                </div>

                {/* Stats row */}
                <div className="relative mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((stat) => (
                        <div key={stat.label} className="journey-stat-card">
                            <div className="flex items-center gap-2">
                                {stat.icon}
                                <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Tabbed Content ────────────────────────────────────── */}
            <JourneyTabs
                bookmarkedCompanions={bookmarkedCompanions}
                sessionHistory={sessionHistory}
                companions={companions}
            />
        </main>
    );
};

export default Profile;
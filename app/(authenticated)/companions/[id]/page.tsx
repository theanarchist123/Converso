import { getCompanion } from "@/lib/actions/companion.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CompanionComponent from "@/components/CompanionComponent";

interface CompanionSessionPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ continue?: string }>;
}

const CompanionSession = async ({ params, searchParams }: CompanionSessionPageProps) => {
    const { id } = await params;
    const { continue: continueSession } = await searchParams;
    const companion = await getCompanion(id);
    const user = await currentUser();

    const { name } = companion;

    if (!user) redirect('/sign-in');
    if (!name) redirect('/companions')

    return (
        <CompanionComponent
            {...companion}
            companionId={id}
            userName={user.firstName!}
            userImage={user.imageUrl!}
            continueFromSession={continueSession === 'true'}
        />
    )
}

export default CompanionSession
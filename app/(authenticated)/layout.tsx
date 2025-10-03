import Navbar from "@/components/Navbar";
import BanStatusMonitor from "@/components/BanStatusMonitor";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <BanStatusMonitor />
            <Navbar />
            {children}
        </>
    )
}

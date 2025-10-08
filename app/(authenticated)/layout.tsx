import Navbar from "@/components/Navbar";
import BanStatusMonitor from "@/components/BanStatusMonitor";
import { BanListener } from "@/components/BanListener";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <BanStatusMonitor />
            <BanListener />
            <Navbar />
            {children}
        </>
    )
}

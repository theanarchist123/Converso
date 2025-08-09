import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
    const user = await currentUser();
    
    if (user) {
        // User is authenticated, redirect to the main app
        redirect("/app");
    } else {
        // User is not authenticated, show marketing page
        redirect("/marketing");
    }
}
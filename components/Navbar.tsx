import React from 'react'
import Link from "next/link";
import Image from "next/image";
import NavItems from "@/components/NavItems";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link href="/">
                <div className="flex items-center gap-2.5 cursor-pointer">
                    <Image
                        src="/images/logo.svg"
                        alt="logo"
                        width={46}
                        height={44}
                    />
                </div>
            </Link>
            <div className="flex items-center gap-8">
                <NavItems/>
                <ThemeToggle />
                <SignedOut>
                    <Link href="/sign-in">
                        <button className="btn-signin">Sign In</button>
                    </Link>
                </SignedOut>
                <SignedIn>
                    <UserButton afterSignOutUrl="/marketing" />
                </SignedIn>
            </div>
        </nav>
    )
}
export default Navbar

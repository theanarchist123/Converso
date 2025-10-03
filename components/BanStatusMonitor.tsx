'use client';

import { useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

/**
 * BanStatusMonitor - Client component that monitors user ban status
 * Automatically logs out users when they get banned or deleted
 * Place this in the authenticated layout
 */
export default function BanStatusMonitor() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Check ban status every 10 seconds
    const checkBanStatus = setInterval(async () => {
      try {
        // Reload user data from Clerk
        await user.reload();
        
        // Check if user is banned via publicMetadata or if account is inaccessible
        const isBanned = (user.publicMetadata as any)?.status === 'banned';
        
        // If user is banned, immediately sign out and redirect
        if (isBanned) {
          console.log('🚫 User has been banned. Logging out...');
          
          // Clear any local storage
          localStorage.clear();
          
          // Sign out and redirect to banned page
          await signOut();
          router.push('/banned');
          
          // Clear interval
          clearInterval(checkBanStatus);
        }
      } catch (error) {
        // If user fetch fails (user might be deleted), sign out
        console.error('❌ Error checking user status:', error);
        console.log('🗑️ User may have been deleted. Logging out...');
        
        localStorage.clear();
        await signOut();
        router.push('/');
        
        clearInterval(checkBanStatus);
      }
    }, 10000); // Check every 10 seconds

    // Initial check
    const isBanned = (user.publicMetadata as any)?.status === 'banned';
    if (isBanned) {
      console.log('🚫 User is banned. Redirecting...');
      router.push('/banned');
    }

    // Cleanup on unmount
    return () => clearInterval(checkBanStatus);
  }, [user, isLoaded, signOut, router]);

  // This component renders nothing
  return null;
}

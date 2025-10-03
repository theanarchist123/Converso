'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Ban, LogOut, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BannedPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  useEffect(() => {
    // If user is not loaded yet, wait
    if (!isLoaded) return;

    // If user is loaded and NOT banned, redirect to app
    const isBanned = (user?.publicMetadata as any)?.status === 'banned';
    if (user && !isBanned) {
      router.push('/app');
    }
  }, [user, isLoaded, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleContactSupport = () => {
    window.location.href = 'mailto:support@converso.app?subject=Appeal%20Account%20Ban';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-black to-red-950 flex items-center justify-center px-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-red-400/10 to-red-600/10" />
      </div>

      <Card className="w-full max-w-md border-red-600/30 bg-black/95 backdrop-blur-sm shadow-2xl z-10">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-red-600 to-red-800 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Ban className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-red-400">
            Account Banned
          </CardTitle>
          <CardDescription className="text-red-300/80 text-base">
            Your account has been permanently banned from using Converso
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-red-950/50 border border-red-600/30">
            <h3 className="text-lg font-semibold text-red-300 mb-2">Why was I banned?</h3>
            <p className="text-red-200/70 text-sm leading-relaxed">
              Your account has been banned by an administrator for violating our Terms of Service or Community Guidelines.
              You can no longer access the platform or sign in to your account.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-red-950/30 border border-red-600/20">
            <h3 className="text-lg font-semibold text-red-300 mb-2">What can I do?</h3>
            <ul className="space-y-2 text-red-200/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Contact our support team if you believe this is a mistake</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Submit an appeal explaining your case</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">•</span>
                <span>Review our Terms of Service and Community Guidelines</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={handleContactSupport}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              className="w-full border-red-600/50 text-red-300 hover:bg-red-950/30 hover:text-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>

          <div className="text-center pt-4 border-t border-red-600/20">
            <p className="text-red-400/60 text-xs">
              Ban Date: {user?.publicMetadata?.bannedAt 
                ? new Date(user.publicMetadata.bannedAt as string).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'Recently'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } catch (error) {
        // Handle localStorage access error
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    // Only run on client side
    checkAuth();
  }, [router]);

  // Show loading state during hydration
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return null; // This component will redirect, so no need to render anything
}
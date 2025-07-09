"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RegistrationWizard } from '@/components/tender_match_pro/registration-wizard';
import { Button } from '@/components/ui/button';
import { LogOut, User, ArrowLeft } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';

export default function TenderMatchProPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const user = await response.json();
          setUserEmail(user.email);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, isMounted]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToDashboard}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Tendorix Pro</h1>
                  <p className="text-sm text-gray-500">Company Registration</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{userEmail}</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Company Registration
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete your company profile to start receiving personalized tender matches. 
            This comprehensive form will help us understand your business capabilities and requirements.
          </p>
        </div>

        <RegistrationWizard />
      </main>
      
      <Toaster />
    </div>
  );
}
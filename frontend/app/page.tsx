"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token"); // or your auth mechanism
    if (!token) {
      router.push("/login"); // Redirect to login if no token
    } else {
      router.push("/tender-match-pro"); // Or /dashboard if needed
    }
  }, []);

  return null; // Show nothing while redirecting
}

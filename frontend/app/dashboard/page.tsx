"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      fetch("http://localhost:8000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => {
          setUserEmail(user.email);
        })
        .catch(() => router.push("/login"));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="dashboard p-6 max-w-2xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-6">Welcome to Tendorix Studio</h1>
      {userEmail && <p className="mb-4 text-gray-700">Logged in as: {userEmail}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <button onClick={() => router.push("/company-profile")} className="btn-primary">Fill Company Profile</button>
        <button onClick={() => router.push("/tenders/upload")} className="btn-primary">Upload Tender</button>
        <button onClick={() => router.push("/tenders/filter")} className="btn-primary">Filter Tenders</button>
        <button onClick={() => router.push("/match")} className="btn-primary">Get Matching Score</button>
      </div>
      <button onClick={handleLogout} className="text-red-600 hover:underline">Logout</button>
    </div>
  );
}

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function HomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      router.replace("/dashboard"); // or /match if you want
    } else {
      router.replace("/login");
    }
  }, [router]);

  return null;
}

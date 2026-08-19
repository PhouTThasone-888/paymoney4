"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/register"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const isPublic = PUBLIC_PATHS.includes(pathname);

      if (!token && !isPublic) {
        setAuthorized(false);
        setLoading(false);
        router.replace("/login");
      } else {
        setAuthorized(true);
        setLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (loading || (!authorized && !isPublic)) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-success mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="text-muted fw-bold">ກຳລັງກວດສອບສິດການເຂົ້າໃຊ້ງານ...</div>
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // ບໍ່ສະແດງ Navbar ຢູ່ໜ້າ login ແລະ register
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // 5 Folder ທີ່ຕ້ອງການໃຫ້ລິ້ງໄປ
  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: "bi-speedometer2" },
    { name: "ພະນັກງານ", path: "/employee", icon: "bi-people" },
    { name: "ຕຳແໜ່ງ", path: "/positions", icon: "bi-briefcase" },
    { name: "ເງິນເດືອນ", path: "/payroll", icon: "bi-calculator" },
    { name: "ການໂອນເງິນ", path: "/bank-transfers", icon: "bi-bank" },
  ];

  return (
    <div className="bg-success text-white shadow-sm sticky-top">
      <div className="container-fluid px-3 py-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
        {/* Logo */}
        <Link href="/dashboard" className="text-white text-decoration-none fw-bold fs-5 d-flex align-items-center gap-2">
          <i className="bi bi-wallet2 text-warning fs-4"></i>
          <span>Payroll System</span>
        </Link>

        {/* Links Menu */}
        <div className="d-flex flex-wrap align-items-center gap-2">
          <div className="d-flex flex-wrap align-items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`btn btn-sm text-white d-flex align-items-center gap-1 border-0 ${
                    isActive ? "bg-white bg-opacity-25 fw-bold" : "opacity-75"
                  }`}
                >
                  <i className={`bi ${item.icon} ${isActive ? "text-warning" : ""}`}></i>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* ปุ่ม ออกจากระบบ */}
          <button
            onClick={handleLogout}
            className="btn btn-sm btn-outline-light d-flex align-items-center gap-1 ms-2 border-opacity-50"
            title="ອອກຈາກລະບົບ"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>ອອກຈາກລະບົບ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
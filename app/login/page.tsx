"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import type { LoginResponse } from "@/types/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      const data = await apiFetch<LoginResponse>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: cleanUsername,
          user_name: cleanUsername,
          email: cleanUsername,
          password: cleanPassword,
        }),
      });

      saveToken(data.token);
      router.push("/payroll");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid username or password (ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ)"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#051f12] via-[#0b3820] to-[#04190e] p-4">
      {/* Background Decorative Glowing Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Luxury Glass Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-emerald-500/20">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0d3b23] to-[#1e5e38] text-amber-400 shadow-lg shadow-emerald-900/30 mb-4 border border-emerald-400/20">
            <i className="bi bi-wallet2 text-3xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Payroll System
          </h1>
          <p className="text-emerald-700 font-medium mt-1 text-sm">
            ລະບົບຈັດການເງິນເດືອນ - ເຂົ້າໃຊ້ງານລະບົບ
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username Input */}
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              Username / Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-600">
                <i className="bi bi-person-fill text-lg"></i>
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ປ້ອນ Username ຫຼື Email"
                className="w-full pl-11 pr-4 py-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white text-gray-900 placeholder-gray-400 font-medium transition-all duration-200"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              Password / ລະຫັດຜ່ານ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-600">
                <i className="bi bi-lock-fill text-lg"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="ປ້ອນລະຫັດຜ່ານ"
                className="w-full pl-11 pr-11 py-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white text-gray-900 placeholder-gray-400 font-medium transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-emerald-600 transition"
              >
                <i className={`bi ${showPassword ? "bi-eye-slash-fill" : "bi-eye-fill"} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3.5 rounded-xl text-sm border border-red-200 font-medium">
              <i className="bi bi-exclamation-triangle-fill text-lg flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#0d3b23] via-[#1a5e38] to-[#144c2c] hover:from-[#11492c] hover:to-[#1a5e38] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/30 hover:shadow-xl hover:shadow-emerald-900/40 transition-all duration-200 transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>ກຳລັງເຂົ້າໃຊ້ງານ...</span>
              </>
            ) : (
              <>
                <i className="bi bi-[#10b981] bi-box-arrow-in-right text-lg text-amber-300 me-1"></i>
                <span>Login / ເຂົ້າໃຊ້ລະບົບ</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Register Link */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            ຍັງບໍ່ມີບັນຊີຜູ້ໃຊ້ງານ?{" "}
            <Link
              href="/register"
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline ms-1 inline-flex items-center gap-1 transition"
            >
              <span>Register / ລົງທະບຽນ</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
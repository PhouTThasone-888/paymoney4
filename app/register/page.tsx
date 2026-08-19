"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("ລະຫັດຜ່ານ ແລະ ຢືນຢັນລະຫັດຜ່ານບໍ່ກົງກັນ");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      try {
        await apiFetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({
            username: cleanUsername,
            user_name: cleanUsername,
            email: cleanUsername,
            password: cleanPassword,
          }),
        });
      } catch (err: any) {
        if (err?.message?.includes("404") || err?.message?.includes("Not Found")) {
          await apiFetch("/users", {
            method: "POST",
            body: JSON.stringify({
              user_name: cleanUsername,
              username: cleanUsername,
              email: cleanUsername,
              password: cleanPassword,
            }),
          });
        } else {
          throw err;
        }
      }

      setSuccess("ລົງທະບຽນສຳເລັດແລ້ວ! ກຳລັງນຳທ່ານໄປໜ້າ Login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "ລົງທະບຽນບໍ່ສຳເລັດ"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#051f12] via-[#0b3820] to-[#04190e] p-4">
      {/* Background Decorative Glowing Elements */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Luxury Glass Card */}
      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-emerald-500/20 my-6">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0d3b23] to-[#1e5e38] text-amber-400 shadow-lg shadow-emerald-900/30 mb-4 border border-emerald-400/20">
            <i className="bi bi-person-plus-fill text-3xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-emerald-700 font-medium mt-1 text-sm">
            ລົງທະບຽນຜູ້ໃຊ້ງານໃໝ່ - Payroll System
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full pl-11 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white text-gray-900 placeholder-gray-400 font-medium transition-all duration-200"
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
                className="w-full pl-11 pr-11 py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white text-gray-900 placeholder-gray-400 font-medium transition-all duration-200"
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

          {/* Confirm Password Input */}
          <div>
            <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              Confirm Password / ຢືນຢັນລະຫັດຜ່ານ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-emerald-600">
                <i className="bi bi-[#10b981] bi-shield-lock-fill text-lg"></i>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="ຢືນຢັນລະຫັດຜ່ານອີກຄັ້ງ"
                className="w-full pl-11 pr-4 py-3 bg-emerald-50/40 border border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 focus:bg-white text-gray-900 placeholder-gray-400 font-medium transition-all duration-200"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-200 font-medium">
              <i className="bi bi-exclamation-triangle-fill text-lg flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm border border-emerald-200 font-medium">
              <i className="bi bi-check-circle-fill text-lg flex-shrink-0"></i>
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-[#0d3b23] via-[#1a5e38] to-[#144c2c] hover:from-[#11492c] hover:to-[#1a5e38] text-white font-bold rounded-xl shadow-lg shadow-emerald-950/30 hover:shadow-xl hover:shadow-emerald-900/40 transition-all duration-200 transform active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 text-base mt-2"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status"></span>
                <span>ກຳລັງບັນທຶກ...</span>
              </>
            ) : (
              <>
                <i className="bi bi-person-check-fill text-lg text-amber-300 me-1"></i>
                <span>Register / ລົງທະບຽນ</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Login Link */}
        <div className="mt-6 pt-5 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600 font-medium">
            ມີບັນຊີຜູ້ໃຊ້ງານຢູ່ແລ້ວ?{" "}
            <Link
              href="/login"
              className="text-emerald-700 font-bold hover:text-emerald-800 hover:underline ms-1 inline-flex items-center gap-1 transition"
            >
              <span>Login / ເຂົ້າໃຊ້ລະບົບ</span>
              <i className="bi bi-arrow-right"></i>
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
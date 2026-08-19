"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Employee {
  emp_id: number;
  emp_name: string;
  bank_number: string;
}

interface Payroll {
  payroll_id: number;
  emp_id: number;
  pay_period_month: number;
  net_salary: number;
  employee?: Employee;
}

interface BankTransfer {
  transfer_id: number;
  payroll_id: number;
  amount_transferred: number;
  transfer_date: string;
  bank_response_code: string;
  payroll?: Payroll;
}

type ApiResponse<T> = T | { data: T };

export default function BankTransfersPage() {
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [transferRes, payrollRes, employeeRes] = await Promise.all([
        apiFetch<ApiResponse<BankTransfer[]>>("/BankTransfers"),
        apiFetch<ApiResponse<Payroll[]>>("/Payrolls"),
        apiFetch<ApiResponse<Employee[]>>("/employee"),
      ]);

      const rawTransfers: BankTransfer[] = Array.isArray(transferRes)
        ? transferRes
        : transferRes?.data || [];
      const rawPayrolls: Payroll[] = Array.isArray(payrollRes)
        ? payrollRes
        : payrollRes?.data || [];
      const rawEmployees: Employee[] = Array.isArray(employeeRes)
        ? employeeRes
        : employeeRes?.data || [];

      const mergedTransfers = rawTransfers.map((tf: BankTransfer) => {
        const foundPayroll = rawPayrolls.find(
          (p) => Number(p.payroll_id) === Number(tf.payroll_id)
        );
        const foundEmployee = rawEmployees.find(
          (e) => Number(e.emp_id) === Number(foundPayroll?.emp_id)
        );

        return {
          ...tf,
          payroll: {
            ...foundPayroll,
            payroll_id: foundPayroll?.payroll_id ?? tf.payroll_id,
            emp_id: foundPayroll?.emp_id ?? 0,
            pay_period_month: foundPayroll?.pay_period_month ?? 0,
            net_salary: foundPayroll?.net_salary ?? 0,
            employee: foundEmployee || tf.payroll?.employee,
          },
        };
      });

      setTransfers(mergedTransfers);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Filter ຂໍ້ມູນຕາມ Search Term & Month
  const filteredTransfers = transfers.filter((item) => {
    const empName = item.payroll?.employee?.emp_name?.toLowerCase() || "";
    const bankNum = item.payroll?.employee?.bank_number || "";
    const transferId = String(item.transfer_id);
    const matchesSearch =
      empName.includes(searchTerm.toLowerCase()) ||
      bankNum.includes(searchTerm) ||
      transferId.includes(searchTerm);

    const month = item.payroll?.pay_period_month;
    const matchesMonth =
      selectedMonth === "ALL" || String(month) === selectedMonth;

    return matchesSearch && matchesMonth;
  });

  const totalTransferred = filteredTransfers.reduce(
    (acc, curr) => acc + Number(curr.amount_transferred || 0),
    0
  );

  const avgTransferred =
    filteredTransfers.length > 0
      ? totalTransferred / filteredTransfers.length
      : 0;

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-emerald-950 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-100/90 via-teal-50 to-emerald-50 p-6 md:p-8 border border-emerald-200/60 shadow-sm">
          <div className="absolute -right-10 -top-10 w-60 h-60 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 flex items-center justify-center">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-950">
                  ປະຫວັດການໂອນເງິນຜ່ານທະນາຄານ
                </h1>
                <p className="text-emerald-700/80 text-sm mt-0.5">
                  Bank Transfer History & Financial Transaction Logs
                </p>
              </div>
            </div>

            <button
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium transition-all duration-200 shadow-sm disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>ໂຫຼດຂໍ້ມູນໃໝ່</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Total Transactions */}
          <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800/70">ລາຍການໂອນທັງໝົດ</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-950">{filteredTransfers.length.toLocaleString()}</span>
                  <span className="text-xs text-emerald-700 font-medium">ລາຍການ</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2: Total Amount */}
          <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800/70">ຍອດເງິນໂອນລວມທັງໝົດ</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-700">{totalTransferred.toLocaleString()}</span>
                  <span className="text-xs text-emerald-600 font-bold">LAK</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Average Amount */}
          <div className="rounded-2xl bg-white border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-800/70">ຍອດໂອນສະເລ່ຍ / ລາຍການ</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-teal-700">{Math.round(avgTransferred).toLocaleString()}</span>
                  <span className="text-xs text-teal-600 font-bold">LAK</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Table Container */}
        <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm overflow-hidden">
          
          {/* Controls / Filters Header */}
          <div className="p-5 border-b border-emerald-100 bg-emerald-50/30 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600/60">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-emerald-200/80 text-emerald-950 placeholder-emerald-700/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
                placeholder="ຄົ້ນຫາຊື່ພະນັກງານ, ເລກບັນຊີ, ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="w-full md:w-60">
              <select
                className="w-full px-4 py-2.5 rounded-xl bg-white border border-emerald-200/80 text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm cursor-pointer"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="ALL">-- ປະຈຳເດືອນທັງໝົດ --</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    ເດືອນ {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                <p className="text-emerald-800/60 text-sm">ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
              </div>
            ) : error ? (
              <div className="m-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center gap-3">
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
              </div>
            ) : filteredTransfers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-emerald-800/40">
                <svg className="w-12 h-12 mb-2 stroke-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm font-medium">ບໍ່ມີຂໍ້ມູນການໂອນເງິນ</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-emerald-100 bg-emerald-50/50 text-emerald-900 text-xs uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">ID ໂອນ</th>
                    <th className="py-3.5 px-6">ຊື່ພະນັກງານ</th>
                    <th className="py-3.5 px-6">ເລກບັນຊີ Bank</th>
                    <th className="py-3.5 px-6">ຈຳນວນເງິນໂອນ</th>
                    <th className="py-3.5 px-6">ວັນທີ-ເວລາ ໂອນ</th>
                    <th className="py-3.5 px-6 text-center">ສະຖານະ Bank Response</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 text-sm">
                  {filteredTransfers.map((item) => (
                    <tr key={item.transfer_id} className="hover:bg-emerald-50/40 transition-colors">
                      
                      {/* ID */}
                      <td className="py-3.5 px-6">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-100/60 text-emerald-800 font-mono text-xs font-semibold">
                          #{item.transfer_id}
                        </span>
                      </td>

                      {/* Employee Info */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {(item.payroll?.employee?.emp_name?.[0] || "E").toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-emerald-950">
                              {item.payroll?.employee?.emp_name || "ບໍ່ລະບຸ"}
                            </div>
                            <div className="text-xs text-emerald-700/60">
                              {item.payroll?.pay_period_month ? `ເດືອນ ${item.payroll.pay_period_month}` : "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Bank Number */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2 text-emerald-900/80 font-mono">
                          <svg className="w-4 h-4 text-emerald-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span>{item.payroll?.employee?.bank_number || "-"}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-6">
                        <span className="text-base font-bold text-emerald-600">
                          + {Number(item.amount_transferred).toLocaleString()}{" "}
                          <span className="text-xs font-normal text-emerald-700/60">LAK</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-6 text-emerald-800/70 text-xs">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-emerald-600/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>
                            {item.transfer_date
                              ? new Date(item.transfer_date).toLocaleString("la-LA")
                              : "-"}
                          </span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100/80 text-emerald-800 border border-emerald-200/60">
                          <svg className="w-3.5 h-3.5 fill-current text-emerald-600" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {item.bank_response_code || "SUCCESS_200"}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
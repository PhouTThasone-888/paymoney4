"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Employee {
  emp_id: number;
  emp_name: string;
}

interface Payroll {
  payroll_id: number;
  emp_id: number;
  net_salary: number;
  status?: string;
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

export default function DashboardPage() {
  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [totalCalculated, setTotalCalculated] = useState<number>(0);
  const [totalPayrollAmount, setTotalPayrollAmount] = useState<number>(0);
  const [totalTransferredCount, setTotalTransferredCount] = useState<number>(0);
  const [recentTransfers, setRecentTransfers] = useState<BankTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const [empRes, payrollRes, transferRes] = await Promise.all([
        apiFetch<Employee[] | { data: Employee[] }>("/employee"),
        apiFetch<Payroll[] | { data: Payroll[] }>("/Payrolls"),
        apiFetch<BankTransfer[] | { data: BankTransfer[] }>("/BankTransfers"),
      ]);

      const employees: Employee[] = Array.isArray(empRes)
        ? empRes
        : empRes?.data || [];
      const payrolls: Payroll[] = Array.isArray(payrollRes)
        ? payrollRes
        : payrollRes?.data || [];
      const transfers: BankTransfer[] = Array.isArray(transferRes)
        ? transferRes
        : transferRes?.data || [];

      setTotalEmployees(employees.length);
      setTotalCalculated(payrolls.length);

      const sumAmount = payrolls.reduce(
        (acc, curr) => acc + Number(curr.net_salary || 0),
        0
      );
      setTotalPayrollAmount(sumAmount);
      setTotalTransferredCount(transfers.length);

      const mergedTransfers: BankTransfer[] = transfers
        .slice(-5)
        .reverse()
        .map((tf) => {
          const foundPayroll = payrolls.find(
            (p) => Number(p.payroll_id) === Number(tf.payroll_id)
          );
          const foundEmployee = employees.find(
            (e) => Number(e.emp_id) === Number(foundPayroll?.emp_id)
          );

          return {
            ...tf,
            payroll: foundPayroll
              ? {
                ...foundPayroll,
                employee: foundEmployee,
              }
              : undefined,
          };
        });

      setRecentTransfers(mergedTransfers);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ Dashboard";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  return (
    <div
      className="min-vh-100 py-4"
      style={{
        background: "linear-gradient(135deg, #0a2517 0%, #133e27 40%, #1e5637 100%)",
        color: "#f8faf9",
      }}
    >
      <div className="container-fluid px-4 max-w-7xl mx-auto">
        {/* Header Bar */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 bg-white bg-opacity-10 backdrop-blur p-4 rounded-4 border border-white border-opacity-10 shadow-lg">
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-3 rounded-4 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                width: "56px",
                height: "56px",
              }}
            >
              <i className="bi bi-speedometer2 fs-3 text-white"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-white">
                Dashboard ພາບລວມລະບົບ Payroll
              </h3>
              <p className="text-white-50 mb-0 small">
                System Overview & Key Metrics Summary
              </p>
            </div>
          </div>

          <button
            className="btn btn-emerald fw-semibold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2"
            onClick={() => fetchDashboardData(true)}
            disabled={loading}
            style={{
              backgroundColor: "#10b981",
              color: "#ffffff",
              border: "none",
            }}
          >
            <i className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`}></i>
            ໂຫຼດຂໍ້ມູນໃໝ່
          </button>
        </div>

        {/* Metric Cards (4 ບ໋ອກ - Clean White UI) */}
        <div className="row g-3 mb-4">
          {/* Card 1 */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div className="overflow-hidden me-2">
                  <div className="text-muted small fw-medium mb-1 text-truncate">
                    ພະນັກງານທັງໝົດ
                  </div>
                  <div className="fs-3 fw-bold text-dark text-truncate">
                    {totalEmployees.toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">ຄົນ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#e8f5e9", color: "#2e7d32", width: "52px", height: "52px" }}
                >
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div className="overflow-hidden me-2">
                  <div className="text-muted small fw-medium mb-1 text-truncate">
                    ລາຍການຄຳນວນແລ້ວ
                  </div>
                  <div className="fs-3 fw-bold text-dark text-truncate">
                    {totalCalculated.toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">ບິນ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#e0f2f1", color: "#00695c", width: "52px", height: "52px" }}
                >
                  <i className="bi bi-calculator-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 (ຕົວເລກເງິນລວມ - ປັບ Size ບໍ່ໃຫ້ລົ້ນ) */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div className="overflow-hidden me-2">
                  <div className="text-muted small fw-medium mb-1 text-truncate">
                    ຍອດເງິນເດືອນລວມ
                  </div>
                  <div className="fs-4 fw-bold text-success text-truncate" title={totalPayrollAmount.toLocaleString()}>
                    {totalPayrollAmount.toLocaleString()}
                  </div>
                  <div className="small text-muted fw-bold">LAK</div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#fff8e1", color: "#f57f17", width: "52px", height: "52px" }}
                >
                  <i className="bi bi-wallet2 fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="col-xl-3 col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div className="overflow-hidden me-2">
                  <div className="text-muted small fw-medium mb-1 text-truncate">
                    ໂອນເງິນສຳເລັດ
                  </div>
                  <div className="fs-3 fw-bold text-dark text-truncate">
                    {totalTransferredCount.toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">ບິນ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: "#e8f5e9", color: "#10b981", width: "52px", height: "52px" }}
                >
                  <i className="bi bi-check-circle-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ຕາຕະລາງ 5 ລາຍການໂອນເງິນຫຼ້າສຸດ */}
        <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
          <div className="card-header bg-white border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
            <h5 className="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i className="bi bi-clock-history text-success"></i> 5 ລາຍການໂອນເງິນຫຼ້າສຸດ
            </h5>
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">ກຳລັງໂຫຼດ...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger m-4 rounded-3">
                <i className="bi bi-exclamation-triangle me-2"></i> {error}
              </div>
            ) : recentTransfers.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="bi bi-inbox fs-1 d-block mb-2 text-success opacity-50"></i>
                ບໍ່ມີຂໍ້ມູນການໂອນເງິນ
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead style={{ backgroundColor: "#f8faf9", color: "#2d3748" }}>
                    <tr>
                      <th className="px-4 py-3 text-secondary small fw-bold">ID ໂອນ</th>
                      <th className="py-3 text-secondary small fw-bold">ຊື່ພະນັກງານ</th>
                      <th className="py-3 text-secondary small fw-bold">ຈຳນວນເງິນໂອນ</th>
                      <th className="py-3 text-secondary small fw-bold">ວັນທີ-ເວລາ ໂອນ</th>
                      <th className="py-3 text-center text-secondary small fw-bold">ສະຖານະ Response</th>
                    </tr>
                  </thead>
                  <tbody className="border-top-0">
                    {recentTransfers.map((item) => (
                      <tr key={item.transfer_id}>
                        <td className="px-4 py-3">
                          <span className="badge bg-light text-dark border px-2 py-1 font-monospace">
                            #{item.transfer_id}
                          </span>
                        </td>
                        <td className="py-3 fw-bold text-dark">
                          {item.payroll?.employee?.emp_name || "ບໍ່ລະບຸ"}
                        </td>
                        <td className="py-3 fw-bold text-success">
                          + {Number(item.amount_transferred).toLocaleString()} LAK
                        </td>
                        <td className="py-3 text-muted small">
                          {item.transfer_date
                            ? new Date(item.transfer_date).toLocaleString("la-LA")
                            : "-"}
                        </td>
                        <td className="py-3 text-center">
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-3 py-2 rounded-pill fw-medium">
                            <i className="bi bi-check-circle-fill me-1"></i>
                            {item.bank_response_code || "SUCCESS_200"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
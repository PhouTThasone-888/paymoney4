"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface PositionData {
  position_id?: number;
  position_name?: string;
  base_salary?: number;
}

interface Employee {
  emp_id: number;
  emp_name: string;
  email: string;
  bank_number: string;
  status: string;
  gender: string;
  position_id?: number;
  positions?: PositionData;
  position?: PositionData;
}

interface Payroll {
  payroll_id: number;
  emp_id: number;
  pay_period_month: number;
  total_deductions: number;
  total_all: number;
  net_salary: number;
  calculated_at: string;
  status?: string;
  employee?: Employee;
}

// Type ສໍາລັບຮອງຮັບຂໍ້ມູນ response ຈາກ API (ທັງ Array ໂດຍກົງ ຫຼື ຊ້ອນໃນ Object.data)
type ApiResponse<T> = T | { data: T };

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState<number | "">("");
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<number>(0);

  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [allowances, setAllowances] = useState<number | "">(0);
  const [deductions, setDeductions] = useState<number | "">(0);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // ປ່ຽນ generics ຈາກ <any> ເປັນ <ApiResponse<Payroll[]>> ແລະ <ApiResponse<Employee[]>>
      const [payrollData, employeeData] = await Promise.all([
        apiFetch<ApiResponse<Payroll[]>>("/Payrolls"),
        apiFetch<ApiResponse<Employee[]>>("/employee"),
      ]);

      const parsedPayrolls: Payroll[] = Array.isArray(payrollData)
        ? payrollData
        : payrollData?.data && Array.isArray(payrollData.data)
        ? payrollData.data
        : [];

      const parsedEmployees: Employee[] = Array.isArray(employeeData)
        ? employeeData
        : employeeData?.data && Array.isArray(employeeData.data)
        ? employeeData.data
        : [];

      // ກັ່ນກອງເອົາສະເພາະລາຍການທີ່ status ບໍ່ແມ່ນ 'PAID' ມາສະແດງ
      const pendingPayrolls = parsedPayrolls.filter(
        (p) => p.status !== "PAID"
      );

      setPayrolls(pendingPayrolls);
      setEmployees(parsedEmployees);
    } catch (err: unknown) {
      // ປ່ຽນ err: any ເປັນ err: unknown
      const errorMessage =
        err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນ";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, []);

  const handleSelectEmployee = (empId: number) => {
    setSelectedEmpId(empId);

    if (!empId) {
      setSelectedPosition("");
      setBaseSalary(0);
      return;
    }

    const emp = employees.find((item) => item.emp_id === empId);
    if (emp) {
      const posName =
        emp.positions?.position_name ||
        emp.position?.position_name ||
        "ບໍ່ມີຕຳແໜ່ງ";
      const salary = Number(
        emp.positions?.base_salary || emp.position?.base_salary || 0
      );

      setSelectedPosition(posName);
      setBaseSalary(salary);
    }
  };

  // ຄຳນວນ Net Salary ແບບ Real-time
  const numericAllowances = Number(allowances) || 0;
  const numericDeductions = Number(deductions) || 0;
  const calculatedTotalAll = baseSalary + numericAllowances;
  const calculatedNetSalary = calculatedTotalAll - numericDeductions;

  // ເພີ່ມ/ບັນທຶກ Payroll
  const handleCalculatePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || submitting) return;

    setSubmitting(true);
    try {
      await apiFetch("/Payrolls", {
        method: "POST",
        body: JSON.stringify({
          emp_id: Number(selectedEmpId),
          pay_period_month: Number(month),
          total_all: calculatedTotalAll,
          total_deductions: numericDeductions,
          net_salary: calculatedNetSalary,
          status: "PENDING",
        }),
      });

      // Reset Form
      setSelectedEmpId("");
      setSelectedPosition("");
      setBaseSalary(0);
      setAllowances(0);
      setDeductions(0);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້: " + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayroll = async (payroll_id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບລາຍການຈ່າຍເງິນເດືອນນີ້ແມ່ນບໍ່?")) return;
    try {
      await apiFetch(`/Payrolls/${payroll_id}`, { method: "DELETE" });
      setPayrolls((prev) => prev.filter((p) => p.payroll_id !== payroll_id));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້: " + msg);
    }
  };

  // ຟັງຊັນໂອນເງິນ: ສົ່ງຂໍ້ມູນໂອນ + ອັບເດດ status + ຕັດອອກຈາກຕາຕະລາງທັນທີ
  const handleBankTransfer = async (payroll_id: number, amount: number) => {
    if (!confirm("ຢືນຢັນການໂອນເງິນເດືອນລາຍການນີ້?")) return;

    try {
      // 1. ເຮັດການໂອນເງິນ
      await apiFetch("/BankTransfers", {
        method: "POST",
        body: JSON.stringify({
          payroll_id: payroll_id,
          amount_transferred: Number(amount),
          bank_response_code: "SUCCESS_200",
        }),
      });

      // 2. ອັບເດດ status ຂອງ payroll ໃຫ້ເປັນ PAID ຢູ່ Database
      try {
        await apiFetch(`/Payrolls/${payroll_id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "PAID" }),
        });
      } catch (patchErr) {
        console.warn("Status update warning:", patchErr);
      }

      // 3. ຕັດລາຍການທີ່ໂອນແລ້ວ ອອກຈາກ state ຕາຕະລາງທັນທີ
      setPayrolls((prev) => prev.filter((p) => p.payroll_id !== payroll_id));

      alert("ດຳເນີນການໂອນເງິນສຳເລັດແລ້ວ!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ການໂອນເງິນລົ້ມເຫຼວ: " + msg);
    }
  };

  const totalNetSalary = payrolls.reduce(
    (acc, curr) => acc + Number(curr.net_salary || 0),
    0
  );

  return (
    <div className="min-vh-100 bg-light" style={{ backgroundColor: "#f4f7f4" }}>
      {/* Header Bar */}
      <nav
        className="navbar navbar-expand-lg text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0d3b23 0%, #1a5e38 100%)",
        }}
      >
        <div className="container-fluid px-4 py-1">
          <a
            className="navbar-brand text-white fw-bold d-flex align-items-center gap-2"
            href="#"
          >
            <div className="bg-white bg-opacity-20 p-2 rounded-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-cash-coin fs-4 text-warning"></i>
            </div>
            <div>
              <div className="fs-5 fw-bold leading-none">
                ລະບົບຈັດການເງິນເດືອນ
              </div>
              <div className="small text-white-50 fs-7">
                Payroll Management System
              </div>
            </div>
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-white bg-opacity-10 text-white border border-white border-opacity-20 px-3 py-2 rounded-pill fw-normal">
              <i className="bi bi-person-circle me-1 text-warning"></i> Admin
            </span>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4">
        {/* Metric Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium mb-1">
                    ພະນັກງານທັງໝົດ
                  </div>
                  <div className="fs-3 fw-bold text-success">
                    {employees.length}{" "}
                    <span className="fs-6 fw-normal text-muted">ຄົນ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4"
                  style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
                >
                  <i className="bi bi-people-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium mb-1">
                    ລາຍການຄອງຈ່າຍ (Pending)
                  </div>
                  <div className="fs-3 fw-bold text-dark">
                    {payrolls.length}{" "}
                    <span className="fs-6 fw-normal text-muted">ບິນ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4"
                  style={{ backgroundColor: "#e0f2f1", color: "#00695c" }}
                >
                  <i className="bi bi-receipt fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium mb-1">
                    ຍອດເງິນເດືອນຄອງຈ່າຍລວມ
                  </div>
                  <div className="fs-3 fw-bold text-success">
                    {totalNetSalary.toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">LAK</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4"
                  style={{ backgroundColor: "#fff8e1", color: "#f57f17" }}
                >
                  <i className="bi bi-wallet-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="row g-4">
          {/* Form ຄຳນວນເງິນເດືອນ */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-header bg-transparent border-0 pt-4 px-4 pb-0">
                <h5 className="card-title fw-bold text-success d-flex align-items-center gap-2">
                  <i className="bi bi-calculator-fill text-success"></i>{" "}
                  ຄຳນວນເງິນເດືອນພະນັກງານ
                </h5>
                <p className="text-muted small mb-0">
                  ເລືອກພະນັກງານເພື່ອດຶງຕຳແໜ່ງ ແລະ ເງິນເດືອນອັດໂຕໂນມັດ
                </p>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleCalculatePayroll}>
                  {/* 1. ບ໋ອກເລືອກຊື່ພະນັກງານ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      1. ຊື່ພະນັກງານ <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-success"></i>
                      </span>
                      <select
                        className="form-select border-start-0 ps-0 bg-light"
                        value={selectedEmpId}
                        onChange={(e) =>
                          handleSelectEmployee(Number(e.target.value))
                        }
                        required
                      >
                        <option value="">-- ກະລຸນາເລືອກພະນັກງານ --</option>
                        {employees.map((emp) => (
                          <option key={emp.emp_id} value={emp.emp_id}>
                            {emp.emp_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. ບ໋ອກຕຳແໜ່ງ & ເງິນເດືອນພື້ນຖານ */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-dark small fw-bold">
                        2. ຕຳແໜ່ງ
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-briefcase text-secondary"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0 bg-light fw-medium text-dark"
                          value={selectedPosition}
                          placeholder="ໂຊອັດໂຕໂນມັດ"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-dark small fw-bold">
                        3. ເງິນເດືອນພື້ນຖານ (LAK)
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0">
                          <i className="bi bi-currency-dollar text-secondary"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0 bg-light fw-bold text-success"
                          value={
                            baseSalary ? baseSalary.toLocaleString() : ""
                          }
                          placeholder="0.00"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. ບ໋ອກປະຈຳເດືອນ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      4. ປະຈຳເດືອນ
                    </label>
                    <select
                      className="form-select bg-light"
                      value={month}
                      onChange={(e) => setMonth(Number(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          ເດືອນ {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 4. ເງິນອຸດໜູນ ແລະ ເງິນຫັກ */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label text-dark small fw-bold">
                        5. ເງິນອຸດໜູນ (LAK)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={allowances}
                        onChange={(e) =>
                          setAllowances(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        min="0"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-dark small fw-bold">
                        6. ເງິນຫັກ / ປະກັນໄພ (LAK)
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={deductions}
                        onChange={(e) =>
                          setDeductions(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="0.00"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Real-time Summary Card Inside Form */}
                  <div
                    className="p-3 rounded-3 mb-3 text-white"
                    style={{
                      background:
                        "linear-gradient(135deg, #1b4d2e 0%, #2e7d32 100%)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small opacity-75">
                        ເງິນເດືອນສຸດທິທີ່ຈະໄດ້ຮັບ:
                      </span>
                      <span className="badge bg-white text-success fw-bold">
                        Real-time
                      </span>
                    </div>
                    <div className="fs-3 fw-bold">
                      {calculatedNetSalary.toLocaleString()} LAK
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{
                      backgroundColor: "#1e4d2b",
                      borderColor: "#1e4d2b",
                    }}
                    disabled={!selectedEmpId || submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm"
                          role="status"
                        ></span>
                        ກຳລັງບັນທຶກ...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill"></i> ບັນທຶກ ແລະ
                        ຄຳນວນເງິນເດືອນ
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Payroll List Table */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-header bg-transparent border-0 pt-4 px-4 pb-2 d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title fw-bold text-success mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-table"></i> ຕາຕະລາງລາຍການຈ່າຍເງິນເດືອນ
                  </h5>
                </div>
                <button
                  className="btn btn-sm btn-outline-success rounded-pill px-3"
                  onClick={fetchData}
                  disabled={loading}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i> ໂຫຼດໃໝ່
                </button>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">ກຳລັງໂຫຼດ...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger m-3 rounded-3">
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                  </div>
                ) : payrolls.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-check-circle fs-1 d-block mb-2 text-success opacity-50"></i>
                    ບໍ່ມີລາຍການເງິນເດືອນທີ່ຄອງຈ່າຍ
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead
                        style={{
                          backgroundColor: "#f1f8f3",
                          color: "#1e4d2b",
                        }}
                      >
                        <tr>
                          <th className="px-4 py-3">ID ພະນັກງານ</th>
                          <th className="py-3">ເດືອນ</th>
                          <th className="py-3">ລາຍຮັບລວມ</th>
                          <th className="py-3">ລາຍຫັກລວມ</th>
                          <th className="py-3">ເງິນເດືອນສຸດທິ</th>
                          <th className="py-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payrolls.map((pay) => (
                          <tr key={pay.payroll_id}>
                            <td className="px-4 py-3">
                              <div className="fw-bold text-dark">
                                {pay.employee?.emp_name ||
                                  `ID: ${pay.emp_id}`}
                              </div>
                              <div className="text-muted small">
                                {pay.employee?.bank_number}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-20 px-2 py-1 rounded-2">
                                ເດືອນ {pay.pay_period_month}
                              </span>
                            </td>
                            <td className="text-success fw-medium">
                              {Number(pay.total_all).toLocaleString()}
                            </td>
                            <td className="text-danger">
                              {Number(pay.total_deductions).toLocaleString()}
                            </td>
                            <td className="fw-bold text-success">
                              {Number(pay.net_salary).toLocaleString()} LAK
                            </td>
                            <td className="text-center">
                              <div className="btn-group gap-1">
                                <button
                                  className="btn btn-sm btn-light text-success border"
                                  title="ໂອນເງິນ"
                                  onClick={() =>
                                    handleBankTransfer(
                                      pay.payroll_id,
                                      pay.net_salary
                                    )
                                  }
                                >
                                  <i className="bi bi-send-fill"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-light text-danger border"
                                  title="ລົບ"
                                  onClick={() =>
                                    handleDeletePayroll(pay.payroll_id)
                                  }
                                >
                                  <i className="bi bi-trash-fill"></i>
                                </button>
                              </div>
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
      </div>
    </div>
  );
}
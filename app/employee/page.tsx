"use client";

import React, { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

interface Position {
  position_name: string;
  base_salary: number;
}

interface Employee {
  emp_id: number;
  emp_name: string;
  position_id: number;
  email: string;
  bank_number: string;
  status: string;
  gender: string;
  positions?: Position;
  position?: Position;
}

type ApiResponse<T> = T | { data: T };

export default function EmployeePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [empName, setEmpName] = useState<string>("");
  const [positionId, setPositionId] = useState<number | "">(1);
  const [email, setEmail] = useState<string>("");
  const [bankNumber, setBankNumber] = useState<string>("");
  const [status, setStatus] = useState<string>("Active");
  const [gender, setGender] = useState<string>("Male");

  // Fetch Employee Data
  const fetchEmployees = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await apiFetch<ApiResponse<Employee[]>>("/employee");
      let parsedData: Employee[] = [];

      if (Array.isArray(res)) {
        parsedData = res;
      } else if (res && "data" in res && Array.isArray(res.data)) {
        parsedData = res.data;
      }

      setEmployees(parsedData);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນພະນັກງານ";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEmployees(false);
  }, [fetchEmployees]);

  // Submit Form - ເພີ່ມພະນັກງານໃໝ່
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await apiFetch<unknown>("/employee", {
        method: "POST",
        body: JSON.stringify({
          emp_name: empName,
          position_id: Number(positionId),
          email: email,
          bank_number: bankNumber,
          status: status,
          gender: gender,
        }),
      });

      alert("ບັນທຶກຂໍ້ມູນພະນັກງານໃໝ່ສຳເລັດ!");

      // Reset Form
      setEmpName("");
      setEmail("");
      setBankNumber("");
      setPositionId(1);
      setStatus("Active");
      setGender("Male");

      fetchEmployees(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້: " + message);
    }
  };

  // ລົບພະນັກງານ
  const handleDelete = async (empId: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຂໍ້ມູນພະນັກງານຄົນນີ້ແມ່ນບໍ່?")) return;
    try {
      await apiFetch<unknown>(`/employee/${empId}`, { method: "DELETE" });
      fetchEmployees(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດລົບຂໍ້ມູນໄດ້: " + message);
    }
  };

  return (
    <div className="min-vh-100 py-4" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #e8f5e9 100%)" }}>
      {/* Header Bar - Responsive Flex Wrap */}
      <nav
        className="navbar text-white shadow-sm"
        style={{
          background: "linear-gradient(135deg, #0d3b23 0%, #1a5e38 100%)",
        }}
      >
        <div className="container-fluid px-3 px-md-4 py-1 d-flex justify-content-between align-items-center">
          <a
            className="navbar-brand text-white fw-bold d-flex align-items-center gap-2 m-0"
            href="#"
          >
            <div className="bg-white bg-opacity-20 p-2 rounded-3 d-flex align-items-center justify-content-center">
              <i className="bi bi-people-fill fs-5 fs-md-4 text-warning"></i>
            </div>
            <div>
              <div className="fs-6 fs-md-5 fw-bold leading-none">
                ລະບົບຈັດການຂໍ້ມູນພະນັກງານ
              </div>
              <div className="small text-white-50 fs-7 d-none d-sm-block">
                Employee Management System
              </div>
            </div>
          </a>
        </div>
      </nav>

      <div className="container-fluid px-3 px-md-4 py-3 py-md-4">
        <div className="row g-3 g-lg-4">
          {/* Form ເພີ່ມພະນັກງານ */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-header bg-transparent border-0 pt-3 pt-md-4 px-3 px-md-4 pb-0">
                <h5 className="card-title fw-bold text-success d-flex align-items-center gap-2 fs-6 fs-md-5">
                  <i className="bi bi-person-plus-fill"></i> ເພີ່ມພະນັກງານໃໝ່
                </h5>
                <p className="text-muted small mb-0">
                  ກະລຸນາປ້ອນຂໍ້ມູນພະນັກງານໃຫ້ຄົບຖ້ວນ
                </p>
              </div>

              <div className="card-body p-3 p-md-4">
                <form onSubmit={handleSubmit}>
                  {/* ຊື່ພະນັກງານ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      ຊື່ ແລະ ນາມສະກຸນ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={empName}
                      onChange={(e) => setEmpName(e.target.value)}
                      placeholder="ປ້ອນຊື່ພະນັກງານ"
                      required
                    />
                  </div>

                  {/* ID ຕຳແໜ່ງ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      ID ຕຳແໜ່ງ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      value={positionId}
                      onChange={(e) =>
                        setPositionId(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      placeholder="ໃສ່ ID ຕຳແໜ່ງ (ເຊັ່ນ: 1)"
                      required
                    />
                  </div>

                  {/* ອີເມວ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      ອີເມວ (Email) <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@mail.com"
                      required
                    />
                  </div>

                  {/* ເລກບັນຊີ */}
                  <div className="mb-3">
                    <label className="form-label text-dark small fw-bold">
                      ເລກບັນຊີທະນາຄານ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={bankNumber}
                      onChange={(e) => setBankNumber(e.target.value)}
                      placeholder="ປ້ອນເລກບັນຊີ ຢ່າງນ້ອຍ 9 ຫຼັກ"
                      minLength={9}
                      required
                    />
                  </div>

                  {/* ເພດ & ສະຖານະ */}
                  <div className="row g-2 g-md-3 mb-4">
                    <div className="col-6">
                      <label className="form-label text-dark small fw-bold">
                        ເພດ
                      </label>
                      <select
                        className="form-select"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="Male">ຊາຍ</option>
                        <option value="Female">ຍິງ</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label text-dark small fw-bold">
                        ສະຖານະ
                      </label>
                      <select
                        className="form-select"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm rounded-3 d-flex align-items-center justify-content-center gap-2"
                    style={{ backgroundColor: "#1e4d2b", borderColor: "#1e4d2b" }}
                  >
                    <i className="bi bi-save-fill"></i> ບັນທຶກຂໍ້ມູນ
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* ຕາຕະລາງລາຍຊື່ພະນັກງານ */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 bg-white">
              <div className="card-header bg-transparent border-0 pt-3 pt-md-4 px-3 px-md-4 pb-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                  <h5 className="card-title fw-bold text-success mb-0 d-flex align-items-center gap-2 fs-6 fs-md-5">
                    <i className="bi bi-card-heading"></i> ລາຍຊື່ພະນັກງານທັງໝົດ
                  </h5>
                </div>
                <button
                  className="btn btn-sm btn-outline-success rounded-pill px-3"
                  onClick={() => fetchEmployees(true)}
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
                ) : employees.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2 text-success opacity-50"></i>
                    ບໍ່ມີຂໍ້ມູນພະນັກງານ
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ minWidth: "600px" }}>
                      <thead
                        style={{
                          backgroundColor: "#f1f8f3",
                          color: "#1e4d2b",
                        }}
                      >
                        <tr>
                          <th className="px-3 px-md-4 py-3">ID</th>
                          <th className="py-3">ຊື່ພະນັກງານ</th>
                          <th className="py-3">ຕຳແໜ່ງ</th>
                          <th className="py-3">ອີເມວ / ເລກບັນຊີ</th>
                          <th className="py-3">ສະຖານະ</th>
                          <th className="py-3 text-center">ຈັດການ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {employees.map((emp) => {
                          const posName =
                            emp.positions?.position_name ||
                            emp.position?.position_name ||
                            `ID: ${emp.position_id}`;

                          return (
                            <tr key={emp.emp_id}>
                              <td className="px-3 px-md-4 py-3 fw-bold text-secondary">
                                #{emp.emp_id}
                              </td>
                              <td className="py-3 fw-bold text-dark">
                                {emp.emp_name}
                                <div className="text-muted small fw-normal">
                                  ເພດ: {emp.gender}
                                </div>
                              </td>
                              <td className="py-3 text-success fw-medium">
                                {posName}
                              </td>
                              <td className="py-3">
                                <div className="small text-dark">{emp.email}</div>
                                <div className="text-muted small">
                                  <i className="bi bi-credit-card me-1"></i>
                                  {emp.bank_number}
                                </div>
                              </td>
                              <td className="py-3">
                                <span
                                  className={`badge px-2 py-1 rounded-2 ${emp.status === "Active"
                                      ? "bg-success bg-opacity-10 text-success border border-success border-opacity-20"
                                      : "bg-secondary bg-opacity-10 text-secondary border"
                                    }`}
                                >
                                  {emp.status}
                                </span>
                              </td>
                              <td className="text-center">
                                <button
                                  className="btn btn-sm btn-light text-danger border"
                                  title="ລົບ"
                                  onClick={() => handleDelete(emp.emp_id)}
                                >
                                  <i className="bi bi-trash-fill"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
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
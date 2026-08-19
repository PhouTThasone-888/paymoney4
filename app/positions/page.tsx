"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Position {
  position_id: number;
  position_name: string;
  base_salary: number;
}

// Type ສໍາລັບຮອງຮັບ Response ຈາກ API
type ApiResponse<T> = T | { data: T };

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [positionName, setPositionName] = useState<string>("");
  const [baseSalary, setBaseSalary] = useState<number | "">("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const fetchPositions = async () => {
    setLoading(true);
    setError(null);
    try {
      // ປ່ຽນ generics ຈາກ <any> ເປັນ <ApiResponse<Position[]>>
      const data = await apiFetch<ApiResponse<Position[]>>("/Positions");
      const parsed: Position[] = Array.isArray(data)
        ? data
        : data?.data && Array.isArray(data.data)
        ? data.data
        : [];
      setPositions(parsed);
    } catch (err: unknown) {
      // ປ່ຽນ err: any ເປັນ err: unknown
      const errorMessage =
        err instanceof Error
          ? err.message
          : "ເກີດຂໍ້ຜິດພາດໃນການໂຫຼດຂໍ້ມູນຕຳແໜ່ງ";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPositions();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setPositionName("");
    setBaseSalary("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!positionName || !baseSalary) return;

    setSubmitting(true);
    try {
      if (editingId) {
        await apiFetch(`/Positions/${editingId}`, {
          method: "PUT",
          body: JSON.stringify({
            position_name: positionName,
            base_salary: Number(baseSalary),
          }),
        });
      } else {
        await apiFetch("/Positions", {
          method: "POST",
          body: JSON.stringify({
            position_name: positionName,
            base_salary: Number(baseSalary),
          }),
        });
      }

      resetForm();
      fetchPositions();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດບັນທຶກຂໍ້ມູນໄດ້: " + errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (pos: Position) => {
    setEditingId(pos.position_id);
    setPositionName(pos.position_name);
    setBaseSalary(pos.base_salary);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຕຳແໜ່ງນີ້ແມ່ນບໍ່?")) return;
    try {
      await apiFetch(`/Positions/${id}`, { method: "DELETE" });
      fetchPositions();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "ເກີດຂໍ້ຜິດພາດ";
      alert("ບໍ່ສາມາດລົບຕຳແໜ່ງໄດ້: " + errorMessage);
    }
  };

  // Filter ຂໍ້ມູນ
  const filteredPositions = positions.filter((pos) =>
    pos.position_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ສະຖິຕິ
  const totalPositions = positions.length;
  const avgSalary =
    totalPositions > 0
      ? positions.reduce(
          (acc, curr) => acc + Number(curr.base_salary || 0),
          0
        ) / totalPositions
      : 0;

  return (
    <div
      className="min-vh-100 py-4"
      style={{
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #e8f5e9 100%)",
        color: "#1e293b",
      }}
    >
      <div className="container-fluid px-4 max-w-7xl mx-auto">
        {/* Header Section */}
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4 p-4 rounded-4 shadow-sm"
          style={{
            background: "linear-gradient(135deg, #15803d 0%, #166534 100%)",
          }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="p-3 rounded-4 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)",
                width: "56px",
                height: "56px",
              }}
            >
              <i className="bi bi-briefcase-fill fs-3 text-white"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-white">
                ຈັດການຕຳແໜ່ງ ແລະ ເງິນເດືອນພື້ນຖານ
              </h3>
              <p className="text-white-50 mb-0 small">
                Position & Base Salary Management System
              </p>
            </div>
          </div>

          <button
            className="btn btn-info fw-semibold px-4 py-2 rounded-3 shadow-sm d-flex align-items-center gap-2 text-white"
            onClick={fetchPositions}
            disabled={loading}
            style={{
              backgroundColor: "#0284c7",
              border: "none",
            }}
          >
            <i
              className={`bi bi-arrow-clockwise ${loading ? "spin" : ""}`}
            ></i>
            ໂຫຼດຂໍ້ມູນໃໝ່
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium mb-1">
                    ຈຳນວນຕຳແໜ່ງທັງໝົດ
                  </div>
                  <div className="fs-2 fw-bold text-dark">
                    {totalPositions.toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">ຕຳແໜ່ງ</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#e0f2fe",
                    color: "#0284c7",
                    width: "52px",
                    height: "52px",
                  }}
                >
                  <i className="bi bi-layers-fill fs-3"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card border-0 rounded-4 shadow-sm h-100 bg-white text-dark overflow-hidden">
              <div className="card-body p-4 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-medium mb-1">
                    ເງິນເດືອນພື້ນຖານສະເລ່ຍ
                  </div>
                  <div className="fs-2 fw-bold" style={{ color: "#0284c7" }}>
                    {Math.round(avgSalary).toLocaleString()}{" "}
                    <span className="fs-6 fw-normal text-muted">LAK</span>
                  </div>
                </div>
                <div
                  className="p-3 rounded-4 flex-shrink-0 d-flex align-items-center justify-content-center"
                  style={{
                    backgroundColor: "#f0f9ff",
                    color: "#0369a1",
                    width: "52px",
                    height: "52px",
                  }}
                >
                  <i className="bi bi-cash-stack fs-3"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Form + Table */}
        <div className="row g-4">
          {/* Form Side */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark">
              <div
                className="card-header border-0 py-3 px-4 text-white"
                style={{
                  background: editingId
                    ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                    : "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                }}
              >
                <h5 className="card-title fw-bold mb-0 d-flex align-items-center gap-2">
                  <i
                    className={`bi ${
                      editingId ? "bi-pencil-square" : "bi-plus-circle-fill"
                    }`}
                  ></i>
                  {editingId ? "ແກ້ໄຂຕຳແໜ່ງ" : "ເພີ່ມຕຳແໜ່ງໃໝ່"}
                </h5>
              </div>

              <div className="card-body p-4">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-secondary small">
                      ຊື່ຕຳແໜ່ງ <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-person-badge"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0 shadow-none"
                        placeholder="ເຊັ່ນ: Software Engineer, Accountant"
                        value={positionName}
                        onChange={(e) => setPositionName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold text-secondary small">
                      ເງິນເດືອນພື້ນຖານ (LAK) <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-currency-dollar"></i>
                      </span>
                      <input
                        type="number"
                        className="form-control bg-light border-start-0 shadow-none font-monospace fw-bold text-success"
                        placeholder="0.00"
                        value={baseSalary}
                        onChange={(e) =>
                          setBaseSalary(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn fw-semibold w-100 py-2 rounded-3 shadow-sm text-white d-flex align-items-center justify-content-center gap-2"
                      disabled={submitting}
                      style={{
                        backgroundColor: editingId ? "#f59e0b" : "#0284c7",
                        border: "none",
                      }}
                    >
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm"></span>
                      ) : (
                        <i
                          className={`bi ${
                            editingId ? "bi-check-lg" : "bi-save"
                          }`}
                        ></i>
                      )}
                      {editingId ? "ອັບເດດ" : "ບັນທຶກ"}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-light border fw-semibold px-3 py-2 rounded-3"
                        onClick={resetForm}
                      >
                        ຍົກເລີກ
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Table Side */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white text-dark">
              <div className="card-header bg-white border-0 pt-4 px-4 pb-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                  <h5 className="card-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                    <i className="bi bi-list-task text-info"></i> ລາຍການຕຳແໜ່ງທັງໝົດ
                  </h5>

                  <div style={{ maxWidth: "280px" }}>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control bg-light border-start-0 shadow-none"
                        placeholder="ຄົ້ນຫາຊື່ຕຳແໜ່ງ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-info" role="status">
                      <span className="visually-hidden">ກຳລັງໂຫຼດ...</span>
                    </div>
                  </div>
                ) : error ? (
                  <div className="alert alert-danger m-4 rounded-3">
                    <i className="bi bi-exclamation-triangle me-2"></i> {error}
                  </div>
                ) : filteredPositions.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-inbox fs-1 d-block mb-2 text-info opacity-50"></i>
                    ບໍ່ມີຂໍ້ມູນຕຳແໜ່ງ
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead
                        style={{ backgroundColor: "#f8fafc", color: "#475569" }}
                      >
                        <tr>
                          <th className="px-4 py-3 text-secondary small fw-bold">
                            ID
                          </th>
                          <th className="py-3 text-secondary small fw-bold">
                            ຊື່ຕຳແໜ່ງ
                          </th>
                          <th className="py-3 text-secondary small fw-bold">
                            ເງິນເດືອນພື້ນຖານ
                          </th>
                          <th className="py-3 text-end px-4 text-secondary small fw-bold">
                            ຈັດການ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="border-top-0">
                        {filteredPositions.map((item) => (
                          <tr key={item.position_id}>
                            <td className="px-4 py-3">
                              <span className="badge bg-light text-dark border px-2 py-1 font-monospace">
                                #{item.position_id}
                              </span>
                            </td>
                            <td className="py-3 fw-bold text-dark">
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  className="rounded-circle d-flex align-items-center justify-content-center text-info fw-bold"
                                  style={{
                                    backgroundColor: "#e0f2fe",
                                    width: "34px",
                                    height: "34px",
                                  }}
                                >
                                  <i className="bi bi-person-workspace"></i>
                                </div>
                                {item.position_name}
                              </div>
                            </td>
                            <td className="py-3 fw-bold text-success font-monospace fs-6">
                              {Number(item.base_salary).toLocaleString()}{" "}
                              <span className="small fw-normal text-muted">
                                LAK
                              </span>
                            </td>
                            <td className="py-3 text-end px-4">
                              <div className="d-flex justify-content-end gap-2">
                                <button
                                  className="btn btn-sm btn-outline-warning rounded-2 d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                  onClick={() => handleEdit(item)}
                                  title="ແກ້ໄຂ"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger rounded-2 d-flex align-items-center justify-content-center"
                                  style={{ width: "32px", height: "32px" }}
                                  onClick={() => handleDelete(item.position_id)}
                                  title="ລົບ"
                                >
                                  <i className="bi bi-trash"></i>
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
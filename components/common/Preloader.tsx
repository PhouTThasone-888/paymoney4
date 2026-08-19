"use client";

interface PreloaderProps {
  text?: string;
  fullScreen?: boolean;
}

export default function Preloader({
  text = "ກຳລັງໂຫຼດຂໍ້ມູນ...",
  fullScreen = true,
}: PreloaderProps) {
  if (fullScreen) {
    return (
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
        style={{
          background: "rgba(15, 23, 42, 0.85)",
          backdropFilter: "blur(8px)",
          zIndex: 9999,
          color: "#f8fafc",
        }}
      >
        <div
          className="spinner-border text-info mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="fw-semibold text-light mb-0 fs-6">{text}</p>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div
        className="spinner-border text-info mb-2"
        role="status"
        style={{ width: "2.5rem", height: "2.5rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted small mb-0">{text}</p>
    </div>
  );
}
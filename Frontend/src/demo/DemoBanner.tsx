import { resetDemo } from "./mockApi";

// Small floating note shown only in the public demo build.
export default function DemoBanner() {
  return (
    <div
      role="note"
      style={{
        position: "fixed", left: 12, bottom: 12, zIndex: 2000, maxWidth: "calc(100vw - 24px)",
        display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
        padding: "8px 12px", borderRadius: 999, background: "rgba(15, 23, 42, 0.92)", color: "#e2e8f0",
        font: "500 13px/1.3 Inter, system-ui, sans-serif", boxShadow: "0 6px 24px rgba(0,0,0,.25)",
      }}
    >
      <span>Demo com dados fictícios</span>
      <button
        type="button"
        onClick={() => { resetDemo(); window.location.reload(); }}
        style={{ border: 0, borderRadius: 999, padding: "4px 10px", background: "#22c55e", color: "#052e16", font: "600 12px Inter, system-ui, sans-serif", cursor: "pointer" }}
      >
        Restaurar dados
      </button>
      <a href="https://github.com/Alan-VSouza/Simplify-sales-management" target="_blank" rel="noreferrer" style={{ color: "#93c5fd" }}>
        Código
      </a>
    </div>
  );
}

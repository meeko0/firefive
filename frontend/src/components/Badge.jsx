import "./Badge.css";

const PRESETS = {
  apartment: { label: "Apartment", className: "badge--apartment" },
  dorm: { label: "Dorm", className: "badge--dorm" },
  verified: { label: "✓ Verified", className: "badge--verified" },
};

export default function Badge({ kind, children }) {
  const preset = PRESETS[kind];
  const label = children || (preset ? preset.label : kind);
  const cls = preset ? preset.className : "";
  return <span className={`badge ${cls}`}>{label}</span>;
}

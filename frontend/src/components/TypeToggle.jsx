import "./TypeToggle.css";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "dorm", label: "Dorms" },
  { value: "apartment", label: "Apartments" },
];

export default function TypeToggle({ value, onChange }) {
  return (
    <div className="type-toggle">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={[
            "type-toggle__btn",
            value === opt.value ? "is-active" : "",
            opt.value === "dorm" ? "is-dorm-opt" : "",
          ].join(" ")}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

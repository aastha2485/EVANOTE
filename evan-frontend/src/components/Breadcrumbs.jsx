import { useNavigate } from "react-router-dom";

function Breadcrumbs({ items }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        fontSize: "14px",
        marginBottom: "16px",
        opacity: 0.7,
        flexWrap: "nowrap",
        whiteSpace: "nowrap"
      }}
    >
      {items.map((item, index) => (
  <span
    key={index}
    style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
  >
    <span
      onClick={() => item.path && navigate(item.path)}
      style={{
        cursor: item.path ? "pointer" : "default"
      }}
    >
      {item.label}
    </span>

    {index < items.length - 1 && (
      <span style={{ opacity: 0.5 }}>›</span>
    )}
  </span>
))}
    </div>
  );
}

export default Breadcrumbs;
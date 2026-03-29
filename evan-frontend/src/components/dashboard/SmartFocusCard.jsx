import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBullseye} from "@fortawesome/free-solid-svg-icons";

function SmartFocusCard({ items }) {
  return (
    <div className="card">
      <h3><FontAwesomeIcon icon={faBullseye} /> Smart Focus</h3>

      {items.length === 0 ? (
        <p>Your smart focus will appear here</p>
      ) : (
        items.map((item, i) => (
          <div key={i} style={{ marginBottom: "10px" }}>
            <div>{item.text}</div>
            <small style={{ opacity: 0.6 }}>{item.action}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default SmartFocusCard;
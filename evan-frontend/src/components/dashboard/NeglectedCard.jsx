import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

function NeglectedCard({ items }) {
  return (
    <div className="card">
      <h3><FontAwesomeIcon icon={faExclamationTriangle} /> Neglected</h3>

      {items.length === 0 ? (
        <p>Nothing is being missed right now</p>
      ) : (
        items.map((item, i) => (
          <div key={i}>{item.text}</div>
        ))
      )}
    </div>
  );
}

export default NeglectedCard;
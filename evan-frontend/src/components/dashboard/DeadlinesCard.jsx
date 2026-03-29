import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

function DeadlinesCard({ deadlines }) {
  return (
    <div className="card">
      <h3><FontAwesomeIcon icon={faClock} /> Deadlines</h3>

      {deadlines.length === 0 ? (
        <p>No upcoming deadlines yet</p>
      ) : (
        deadlines.map((d, i) => (
          <div key={i} className="deadline-item">
            <span>
              {d.daysLeft <= 2 ? "🔴" : "🟡"} {d.title}
            </span>
            <small>— {d.daysLeft} days</small>
          </div>
        ))
      )}
    </div>
  );
}

export default DeadlinesCard;
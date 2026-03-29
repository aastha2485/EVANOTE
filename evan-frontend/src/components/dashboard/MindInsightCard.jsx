import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain } from "@fortawesome/free-solid-svg-icons";

function MindInsightCard({ insight }) {
  return (
    <div className="card">
      <h3><FontAwesomeIcon icon={faBrain} /> Mind & Growth</h3>

      {!insight ? (
        <p>Write a few journal entries to unlock insights</p>
      ) : (
        <div>{insight.text}</div>
      )}
    </div>
  );
}

export default MindInsightCard;
import Heatmap from "./Heatmap";
import StreakDisplay from "./StreakDisplay";

function ActivitySection({ data, className }) {

  return (
    <div className={`card ${className}`}>

      <h3>📅 Activity</h3>

      <Heatmap
        dates={data.dates}
        month={data.month}
        year={data.year}
        />

      <StreakDisplay
        current={data.current_streak}
        longest={data.longest_streak}
      />

    </div>
  );
}

export default ActivitySection;
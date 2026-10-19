import ActivityLog from "../components/ActivityLog.jsx";

export default function ActivityPage({ entries }) {
  return (
    <main className="activity-page">
      <div className="activity-page__heading">
        <span>WORKSPACE HISTORY</span>
        <h2>Recent activity</h2>
        <p>Requests made during this session appear here.</p>
      </div>
      <ActivityLog entries={entries} />
    </main>
  );
}
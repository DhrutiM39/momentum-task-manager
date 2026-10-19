const STATUSES = [
  { key: "pending", label: "Pending", color: "var(--accent-pending)" },
  { key: "in-progress", label: "In Progress", color: "var(--accent-progress)" },
  { key: "done", label: "Done", color: "var(--accent-done)" }
];

export default function SummaryCards({ tasks }) {
  const total = tasks.length;
  const counts = STATUSES.reduce((acc, status) => {
    acc[status.key] = tasks.filter((task) => task.status === status.key).length;
    return acc;
  }, {});

  return (
    <section className="summary-cards">
      <div className="summary-card summary-card--total">
        <span>Total tasks</span>
        <strong>{total}</strong>
      </div>
      {STATUSES.map((status) => (
        <div key={status.key} className={`summary-card summary-card--${status.key}`} style={{ "--card-accent": status.color }}>
          <span><i />{status.label}</span>
          <strong>{counts[status.key] || 0}</strong>
        </div>
      ))}
    </section>
  );
}

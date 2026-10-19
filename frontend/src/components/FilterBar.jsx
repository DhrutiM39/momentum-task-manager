export default function FilterBar({ query, filter, onQueryChange, onFilterChange }) {
  return (
    <section className="filter-bar">
      <label className="filter-bar__group">
        <span>Search tasks</span>
        <input
          className="filter-bar__input"
          type="search"
          value={query}
          placeholder="Search title or description"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </label>
      <label className="filter-bar__group">
        <span>Status</span>
        <select
          className="filter-bar__select"
          value={filter}
          onChange={(event) => onFilterChange(event.target.value)}
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </label>
    </section>
  );
}

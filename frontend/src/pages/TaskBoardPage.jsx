import { lazy, Suspense } from "react";
import FilterBar from "../components/FilterBar.jsx";
import NewTaskForm from "../components/NewTaskForm.jsx";
import SummaryCards from "../components/SummaryCards.jsx";

const Board = lazy(() => import("../components/Board.jsx"));

export default function TaskBoardPage({
  tasks,
  completedTasks,
  completion,
  filteredTasks,
  query,
  filter,
  loading,
  submitting,
  busyTaskId,
  onCreate,
  onQueryChange,
  onFilterChange,
  onStatusChange,
  onDelete,
}) {
  return (
    <>
      <section className="workspace-hero" aria-label="Task progress overview">
        <div className="workspace-hero__copy">
          <span className="workspace-hero__eyebrow">YOUR WORKSPACE</span>
          <h2>{tasks.length ? "Make meaningful progress today." : "What will you move forward today?"}</h2>
          <p>{completedTasks} of {tasks.length} tasks are complete.</p>
        </div>
        <div className="workspace-hero__progress">
          <div className="workspace-hero__ring" style={{ "--progress": `${completion * 3.6}deg` }}>
            <strong>{completion}%</strong>
            <span>complete</span>
          </div>
        </div>
      </section>

      <NewTaskForm onCreate={onCreate} submitting={submitting} />
      <SummaryCards tasks={tasks} />
      <FilterBar
        query={query}
        filter={filter}
        onQueryChange={onQueryChange}
        onFilterChange={onFilterChange}
      />
      <div className="filter-summary">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>

      {loading ? (
        <div className="loading">Loading tasks…</div>
      ) : (
        <Suspense fallback={<div className="loading" role="status">Loading task board…</div>}>
          <Board
            tasks={filteredTasks}
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            busyTaskId={busyTaskId}
          />
        </Suspense>
      )}
    </>
  );
}
/**
 * listeners.js — Practical 10: Event-Driven Architecture
 *
 * Registers all event listeners on the shared taskEvents emitter.
 * This file MUST be required exactly once at server startup (in server.js)
 * so that .on() handlers are registered before any events are emitted.
 *
 * Key design points demonstrated:
 *  - Listeners run in the same event-loop tick as emit(), BUT because
 *    res.json() is called before taskEvents.emit(), the HTTP response is
 *    already flushed by the time the listener body executes.
 *  - The artificial 2-second delay inside 'task-created' proves the API
 *    responded long before the handler "finished", making async behaviour
 *    visible in the console timestamps.
 */

const taskEvents = require("./taskEvents");

// ─── task-created listener ─────────────────────────────────────────────────
taskEvents.on("task-created", (task) => {
  // Simulate a slow notification service (e.g. sending an email / push alert).
  // The 2-second delay makes the timestamp difference clearly visible.
  setTimeout(() => {
    console.log("─".repeat(60));
    console.log(`[Notification] 🔔 task-created event fired`);
    console.log(`  Title     : "${task.title}"`);
    console.log(`  Task ID   : ${task._id}`);
    console.log(`  Owner ID  : ${task.owner}`);
    console.log(`  Priority  : ${task.priority}`);
    console.log(`  Status    : ${task.status}`);
    console.log(`  Handler TS: ${new Date().toISOString()}   ← AFTER response`);
    console.log("─".repeat(60));
  }, 2000); // 2-second artificial delay to exaggerate async timing
});

// ─── task-deleted listener ─────────────────────────────────────────────────
taskEvents.on("task-deleted", (task) => {
  setTimeout(() => {
    console.log("─".repeat(60));
    console.log(`[Notification] 🗑️  task-deleted event fired`);
    console.log(`  Title     : "${task.title}"`);
    console.log(`  Task ID   : ${task._id}`);
    console.log(`  Owner ID  : ${task.owner}`);
    console.log(`  Handler TS: ${new Date().toISOString()}   ← AFTER response`);
    console.log("─".repeat(60));
  }, 1000); // 1-second delay for the delete notification
});

// ─── error listener ────────────────────────────────────────────────────────
// Node.js EventEmitter has a special rule: if an 'error' event is emitted
// and there is NO listener registered for it, the process CRASHES with an
// uncaught exception. Registering this listener prevents that.
taskEvents.on("error", (err) => {
  console.error("[EventEmitter] ❌ Error caught in task event listener:");
  console.error(`  Message: ${err.message}`);
  console.error(`  Stack  : ${err.stack}`);
});

console.log("[Events] Task event listeners registered ✓");

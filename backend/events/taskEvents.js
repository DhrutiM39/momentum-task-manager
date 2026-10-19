/**
 * taskEvents.js — Practical 10: Event-Driven Architecture
 *
 * Creates a singleton EventEmitter instance dedicated to task-lifecycle events.
 * By extending EventEmitter rather than using it directly we can add task-
 * specific helper methods in the future without changing the interface.
 *
 * Events emitted by the application:
 *   'task-created'  → { _id, title, owner, status, priority, createdAt }
 *   'task-deleted'  → { _id, title, owner }
 *   'error'         → Error object  (reserved by Node – must always be handled)
 */

const EventEmitter = require("events");

class TaskEvents extends EventEmitter {}

const taskEvents = new TaskEvents();

module.exports = taskEvents;

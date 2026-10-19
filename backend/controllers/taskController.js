const mongoose = require("mongoose");
const Task = require("../models/Task");
const {
  cache,
  allTasksCacheKey,
  singleTaskCacheKey,
  invalidateTaskCache
} = require("../cache/taskCache");
// Practical 10: EventEmitter-based async notification system
const taskEvents = require("../events/taskEvents");

const VALID_STATUSES = ["pending", "in-progress", "done"];

// GET /api/tasks
exports.getAllTasks = async (req, res, next) => {
  try {
    const cacheKey = allTasksCacheKey(req.user.id);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse !== undefined) {
      return res.status(200).json(cachedResponse);
    }

    const tasks = await Task.find({ owner: req.user.id }).lean();
    const response = {
      success: true,
      count: tasks.length,
      data: tasks
    };
    cache.set(cacheKey, response);

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id
exports.getTaskById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    const cacheKey = singleTaskCacheKey(req.user.id, req.params.id);
    const cachedResponse = cache.get(cacheKey);
    if (cachedResponse !== undefined) {
      return res.status(200).json(cachedResponse);
    }

    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id }).lean();

    if (!task) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    const response = {
      success: true,
      data: task
    };
    cache.set(cacheKey, response);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

// POST /api/tasks
exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, completed, priority } = req.body || {};

    if (!title || typeof title !== "string" || !title.trim()) {
      const err = new Error(
        "Title is required and must be a non-empty string"
      );
      err.status = 400;
      return next(err);
    }

    if (status && !VALID_STATUSES.includes(status)) {
      const err = new Error(
        `Status must be one of: ${VALID_STATUSES.join(", ")}`
      );
      err.status = 400;
      return next(err);
    }

    const newTask = await Task.create({
      owner: req.user.id,
      title: title.trim(),
      description: description ? String(description).trim() : "",
      status: status || "pending",
      completed: completed ?? false,
      priority: priority || "medium"
    });

    invalidateTaskCache(req.user.id);

    // Practical 10 – Step 3:
    // Log the API response timestamp FIRST so it appears in the console
    // before the listener's delayed log, providing clear timestamp evidence.
    console.log(`[API] ✅ POST /tasks — response sent at ${new Date().toISOString()}`);

    // Send the HTTP response immediately — the client is unblocked here.
    res.status(201).json({
      success: true,
      data: newTask
    });

    // Emit AFTER res.json() so the response is already on its way.
    // emit() is synchronous in Node.js, but because the listener uses
    // setTimeout, the actual notification logic is deferred to a future
    // event-loop tick — well after the HTTP response has been flushed.
    taskEvents.emit("task-created", newTask);
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
exports.updateTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    const { title, description, status, completed, priority } = req.body || {};

    if (status && !VALID_STATUSES.includes(status)) {
      const err = new Error(
        `Status must be one of: ${VALID_STATUSES.join(", ")}`
      );
      err.status = 400;
      return next(err);
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        ...(title !== undefined && { title: String(title).trim() }),
        ...(description !== undefined && {
          description: String(description).trim()
        }),
        ...(status !== undefined && { status }),
        ...(completed !== undefined && { completed }),
        ...(priority !== undefined && { priority })
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedTask) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    invalidateTaskCache(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
exports.deleteTask = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    const deletedTask = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!deletedTask) {
      const err = new Error(`Task with id ${req.params.id} not found`);
      err.status = 404;
      return next(err);
    }

    invalidateTaskCache(req.user.id, req.params.id);

    // Practical 10 – Supplementary: task-deleted event
    console.log(`[API] ✅ DELETE /tasks/:id — response sent at ${new Date().toISOString()}`);

    res.status(200).json({
      success: true,
      data: deletedTask
    });

    // Emit task-deleted after response; listener logs asynchronously
    taskEvents.emit("task-deleted", deletedTask);
  } catch (err) {
    next(err);
  }
};
const express = require("express");
const router = express.Router();

const validateTaskId = require("../middleware/validateTaskId");
const authenticateToken = require("../middleware/authenticateToken");
const validateTaskInput = require("../middleware/validateTaskInput");
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

router.use(authenticateToken);

router.get("/", getAllTasks);
router.get("/:id", validateTaskId, getTaskById);
router.post("/", validateTaskInput(), createTask);
router.put("/:id", validateTaskId, validateTaskInput(true), updateTask);
router.delete("/:id", validateTaskId, deleteTask);

module.exports = router;

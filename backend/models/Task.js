const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["pending", "in-progress", "done"],
    default: "pending"
  },

  completed: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  priority: {
    type: String,
    enum: ["low", "medium", "high"],
    default: "medium"
  }
});

// Pre-save hook: automatically trim the title before saving
taskSchema.pre("save", function () {
  if (this.title) {
    this.title = this.title.trim();
  }
});

module.exports = mongoose.model("Task", taskSchema);

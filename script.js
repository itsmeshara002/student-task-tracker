
"use strict";

// Student Task Tracker - Task Management

const STORAGE_KEY = "studentTaskTrackerTasks";

const taskForm = document.getElementById("taskForm");
const taskTitleInput = document.getElementById("taskTitle");
const taskCategoryInput = document.getElementById("taskCategory");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskPriorityInput = document.getElementById("taskPriority");
const taskFilter = document.getElementById("taskFilter");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskMessage = document.getElementById("taskMessage");

const totalTasksElement = document.getElementById("totalTasks");
const pendingTasksElement = document.getElementById("pendingTasks");
const completedTasksElement = document.getElementById("completedTasks");

// MEMBER 3: CONTINUE THE JAVASCRIPT HERE

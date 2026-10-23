
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

let tasks = loadTasks();

// Load saved tasks from browser storage.
function loadTasks() {
    try {
        const savedTasks = localStorage.getItem(STORAGE_KEY);

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        if (!Array.isArray(parsedTasks)) {
            return [];
        }

        // Keep only records with the expected basic structure.
        return parsedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean"
        );
    } catch (error) {
        console.error("Could not load saved tasks:", error);
        return [];
    }
}

// Save tasks to browser storage.
function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        return true;
    } catch (error) {
        console.error("Could not save tasks:", error);
        showMessage("Unable to save tasks in this browser.");
        return false;
    }
}

// Display a status message.
function showMessage(message) {
    taskMessage.textContent = message;
}

// Add a new task.
taskForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();

    if (!title) {
        showMessage("Please enter a task name.");
        taskTitleInput.focus();
        return;
    }

    const newTask = {
        id: createTaskId(),
        title: title,
        category: taskCategoryInput.value,
        dueDate: taskDueDateInput.value,
        priority: taskPriorityInput.value,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(newTask);

    if (!saveTasks()) {
        tasks.shift();
        return;
    }

    taskForm.reset();
    taskPriorityInput.value = "Medium";
    taskFilter.value = "all";

    renderTasks();
    showMessage("Task added successfully!");
    taskTitleInput.focus();
});

// Generate a unique ID for each task.
function createTaskId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

// Display tasks based on the selected filter.
function renderTasks() {
    const filter = taskFilter.value;

    const visibleTasks = tasks.filter(task => {
        if (filter === "pending") {
            return !task.completed;
        }

        if (filter === "completed") {
            return task.completed;
        }

        return true;
    });

    taskList.replaceChildren();

    visibleTasks.forEach(task => {
        taskList.appendChild(createTaskCard(task));
    });

    emptyState.hidden = visibleTasks.length > 0;

    if (visibleTasks.length === 0) {
        const emptyTitle = emptyState.querySelector("h3");
        const emptyText = emptyState.querySelector("p");

        if (filter === "pending" && tasks.length > 0) {
            emptyTitle.textContent = "No pending tasks";
            emptyText.textContent = "All your tasks are completed!";
        } else if (filter === "completed" && tasks.length > 0) {
            emptyTitle.textContent = "No completed tasks";
            emptyText.textContent = "Complete a task to see it here.";
        } else {
            emptyTitle.textContent = "No tasks yet";
            emptyText.textContent =
                "Add your first school task using the form above.";
        }
    }

    updateStatistics();
}

// Create an individual task card.
function createTaskCard(task) {
    const card = document.createElement("article");
    card.className = "task-card";

    if (task.completed) {
        card.classList.add("is-completed");
    }

    const main = document.createElement("div");
    main.className = "task-main";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
        "aria-label",
        "Mark " + task.title + " as completed"
    );

    checkbox.addEventListener("change", function () {
        toggleTask(task.id);
    });

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const categoryTag = document.createElement("span");
    categoryTag.className = "tag";
    categoryTag.textContent = task.category || "Other";

    const priorityTag = document.createElement("span");
    const priority = ["Low", "Medium", "High"].includes(task.priority)
        ? task.priority
        : "Medium";

    priorityTag.className =
        "tag priority-" + priority.toLowerCase();
    priorityTag.textContent = priority + " Priority";

    meta.append(categoryTag, priorityTag);

    details.append(title, meta);

    if (task.dueDate) {
        const dueDate = document.createElement("p");
        dueDate.className = "task-date";
        dueDate.textContent = "Due: " + formatDate(task.dueDate);
        details.appendChild(dueDate);
    }

    main.append(checkbox, details);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "action-button delete-button";
    deleteButton.textContent = "Delete";
    deleteButton.setAttribute(
        "aria-label",
        "Delete task " + task.title
    );

    deleteButton.addEventListener("click", function () {
        deleteTask(task.id);
    });

    actions.appendChild(deleteButton);
    card.append(main, actions);

    return card;
}

// Mark a task as completed or pending.
function toggleTask(id) {
    const task = tasks.find(item => item.id === id);

    if (!task) {
        return;
    }

    const previousStatus = task.completed;
    task.completed = !task.completed;

    if (!saveTasks()) {
        task.completed = previousStatus;
        renderTasks();
        return;
    }

    renderTasks();

    showMessage(
        task.completed
            ? "Task marked as completed."
            : "Task marked as pending."
    );
}

// Delete a task.
function deleteTask(id) {
    const taskIndex = tasks.findIndex(item => item.id === id);

    if (taskIndex === -1) {
        return;
    }

    const removedTask = tasks.splice(taskIndex, 1)[0];

    if (!saveTasks()) {
        tasks.splice(taskIndex, 0, removedTask);
        renderTasks();
        return;
    }

    renderTasks();
    showMessage("Task deleted successfully.");
}

// Update the task counters.
function updateStatistics() {
    const completedCount = tasks.filter(task => task.completed).length;
    const pendingCount = tasks.length - completedCount;

    totalTasksElement.textContent = tasks.length;
    pendingTasksElement.textContent = pendingCount;
    completedTasksElement.textContent = completedCount;
}

// Format a date for display.
function formatDate(dateString) {
    const parts = dateString.split("-");

    if (parts.length !== 3) {
        return dateString;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);
    const day = Number(parts[2]);

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
        return dateString;
    }

    return date.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}

// Change the displayed tasks when the filter changes.
taskFilter.addEventListener("change", function () {
    renderTasks();
    showMessage("");
});

// Show the saved tasks when the page opens.
renderTasks();



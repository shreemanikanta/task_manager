const apiBaseUrl = "http://127.0.0.1:8011/task/tasks/";
const generateSummaryUrl = "http://127.0.0.1:8011/task/generate_summary/";
const wsBaseUrl = "ws://127.0.0.1:8011/ws/tasks/";
const token = localStorage.getItem("access_token");
let websocket = null;
const userId = localStorage.getItem("user_id");

document.addEventListener("DOMContentLoaded", function() {
    loadTasks();
    connectWebSocket();

  document.getElementById("createTaskBtn").addEventListener("click", createTask);
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("generateSummaryBtn").addEventListener("click", generateSummary);
});


// WebSocket connection
function connectWebSocket() {
  if (!userId) {
      console.error("User ID not available for WebSocket connection");
      return;
  }

  try {
      // Connect to WebSocket with user ID for room-based updates
      // Backend uses format: f"tasks_user_{task.user.uuid}"
      websocket = new WebSocket(`${wsBaseUrl}${userId}/`);

      websocket.onopen = function(event) {
          console.log("WebSocket connected to tasks_user_" + userId);
          showSuccess("Real-time updates enabled");
      };

      websocket.onmessage = function(event) {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received:", data);
          handleWebSocketMessage(data);
      };

      websocket.onclose = function(event) {
          console.log("WebSocket disconnected");
          // Attempt to reconnect after 3 seconds
          setTimeout(connectWebSocket, 3000);
      };

      websocket.onerror = function(error) {
          console.error("WebSocket error:", error);
      };
  } catch (error) {
      console.error("Failed to connect WebSocket:", error);
  }
}


// Handle WebSocket messages
function handleWebSocketMessage(data) {
  switch (data.type) {
      case 'send_task_update':
          handleTaskUpdate(data);
          break;
      
      default:
          console.log("Unknown WebSocket message type:", data.type);
  }
}

// Handle task update from WebSocket
function handleTaskUpdate(data) {
  const { uuid, status } = data;
  
  // Show appropriate message based on status
  switch (status) {
      case 'Missed':
          showSuccess(`Task status updated to: Missed`);
          break;
      case 'Completed':
          showSuccess(`Task marked as completed`);
          break;
      case 'Upcoming':
          showSuccess(`Task status updated to: Upcoming`);
          break;
      default:
          showSuccess(`Task status updated`);
  }
  
  // Update the specific task in DOM
  updateTaskStatusInDOM(uuid, status);
}

// Update specific task status in DOM
function updateTaskStatusInDOM(taskUuid, newStatus) {
  // Find the task item by UUID
  const taskItem = document.querySelector(`[data-task-uuid="${taskUuid}"]`);
  
  if (!taskItem) {
      // Task not found in current DOM, reload tasks to get latest data
      loadTasks();
      return;
  }
  
  // Get task data from DOM
  const taskTitle = taskItem.querySelector('.task-title').textContent;
  const taskDescription = taskItem.querySelector('.task-description')?.textContent || '';
  const taskDeadline = taskItem.querySelector('.task-meta span').textContent.replace('Due: ', '');
  
  // Remove task from current bucket
  taskItem.remove();
  
  // Create updated task object
  const updatedTask = {
      uuid: taskUuid,
      title: taskTitle,
      description: taskDescription,
      deadline: taskDeadline,
      status: newStatus
  };
  
  // Add to appropriate bucket
  renderSingleTask(updatedTask);
  
  // Update counts and empty states
  updateTaskCounts();
  updateEmptyStates();
}

// Render a single task (helper function)
function renderSingleTask(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.setAttribute('data-task-uuid', task.uuid);
  
  // Use existing deadline format or parse if needed
  let deadlineStr = task.deadline;
  if (task.deadline && !task.deadline.includes('Due:')) {
      try {
          const deadline = new Date(task.deadline);
          deadlineStr = deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      } catch (e) {
          deadlineStr = task.deadline; // Use as-is if parsing fails
      }
  }

  li.innerHTML = `
      <div class="task-title">${task.title}</div>
      ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
      <div class="task-meta">
          <i class="fas fa-clock"></i>
          <span>Due: ${deadlineStr}</span>
      </div>
      <div class="task-status status-${task.status.toLowerCase()}">${task.status}</div>
      <div class="task-actions">
          <button class="task-btn btn-delete" onclick="deleteTask('${task.uuid}')">
              <i class="fas fa-trash"></i> Delete
          </button>
          ${task.status !== 'Completed' ? `
              <button class="task-btn btn-complete" onclick="markComplete('${task.uuid}')">
                  <i class="fas fa-check"></i> Complete
              </button>
          ` : ''}
      </div>
  `;

  if (task.status === "Upcoming") {
      document.querySelector("#upcoming .task-list").appendChild(li);
  } else if (task.status === "Completed") {
      document.querySelector("#completed .task-list").appendChild(li);
  } else if (task.status === "Missed") {
      document.querySelector("#missed .task-list").appendChild(li);
  }
}


//Function to load tasks
function loadTasks() {
  showLoading();
  fetch(apiBaseUrl, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(data => {
    renderTasks(data.data);
    hideLoading();
  })
  
  .catch(err => {
    console.error(err);
    hideLoading();
    showError("Failed to load tasks");
});
}

//Function to render the tasks
function renderTasks(tasks) {
            // Clear buckets
            const buckets = ['upcoming', 'completed', 'missed'];
            buckets.forEach(bucket => {
                const ul = document.querySelector(`#${bucket} .task-list`);
                ul.innerHTML = "";
            });

            // Count tasks
            const counts = { upcoming: 0, completed: 0, missed: 0 };

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.className = "task-item";
                
                // Format deadline
                const deadline = new Date(task.deadline);
                const deadlineStr = deadline.toLocaleDateString() + " " + deadline.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                li.innerHTML = `
                    <div class="task-title">${task.title}</div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    <div class="task-meta">
                        <i class="fas fa-clock"></i>
                        <span>Due: ${deadlineStr}</span>
                    </div>
                    <div class="task-status status-${task.status.toLowerCase()}">${task.status}</div>
                    <div class="task-actions">
                        <button class="task-btn btn-delete" onclick="deleteTask('${task.uuid}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        ${task.status !== 'Completed' ? `
                            <button class="task-btn btn-complete" onclick="markComplete('${task.uuid}')">
                                <i class="fas fa-check"></i> Complete
                            </button>
                        ` : ''}
                    </div>
                `;
                
                if (task.status === "Upcoming") {
                    document.querySelector("#upcoming .task-list").appendChild(li);
                    counts.upcoming++;
                } else if (task.status === "Completed") {
                    document.querySelector("#completed .task-list").appendChild(li);
                    counts.completed++;
                } else {
                    document.querySelector("#missed .task-list").appendChild(li);
                    counts.missed++;
                }
            });

            // Update counts
            document.getElementById("upcomingCount").textContent = counts.upcoming;
            document.getElementById("completedCount").textContent = counts.completed;
            document.getElementById("missedCount").textContent = counts.missed;

            // Show/hide empty states
            buckets.forEach(bucket => {
                const ul = document.querySelector(`#${bucket} .task-list`);
                const emptyState = document.querySelector(`#${bucket} .empty-state`);
                const count = counts[bucket];
                
                if (count === 0) {
                    ul.style.display = "none";
                    emptyState.style.display = "block";
                } else {
                    ul.style.display = "block";
                    emptyState.style.display = "none";
                }
            });
        }


// Function to create task
function createTask() {
  const title = document.getElementById("newTitle").value;
  const description = document.getElementById("newDescription").value;
  const deadline = document.getElementById("newDeadline").value;

  if (!title.trim() || !deadline) {
    showError("Please fill in all required fields");
    return;
  }

  const btn = document.getElementById("createTaskBtn");
  btn.innerHTML = '<div class="loading"></div> Creating...';
  btn.disabled = true;

  fetch(apiBaseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, deadline })
  })
  .then(res => res.json())
  .then(data => {
    showSuccess(data.message || "Task created successfully!");
    document.getElementById("taskForm").reset();
    loadTasks();
  })
  .catch(err => {
    console.error(err);
    showError("Failed to create task");
  })
  .finally(() => {
      btn.innerHTML = '<i class="fas fa-plus"></i> Add Task';
      btn.disabled = false;
  });
}

function generateSummary() {
  const title = document.getElementById("newTitle").value.trim();
  if (!title) {
    showError("Please enter a task title first.");
    return;
  }

  const btn = document.getElementById("generateSummaryBtn");
  btn.innerHTML = '<div class="loading"></div> Generating...';
  btn.disabled = true;

  fetch(`${generateSummaryUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title: title })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 200) {
      document.getElementById("newDescription").value = data.data.summary;
      showSuccess("Summary generated!");
    } else {
      showError(data.message || "Failed to generate summary");
    }
  })
  .catch(err => {
    console.error(err);
    showError("Failed to generate summary");
  })
  .finally(() => {
    btn.innerHTML = '<i class="fas fa-magic"></i> Generate Summary';
    btn.disabled = false;
  });
}


// Function to delete task
function deleteTask(uuid) {
  if (!confirm("Are you sure you want to delete this task?")) return;

  fetch(`${apiBaseUrl}${uuid}/`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => res.json())
  .then(res => {
    alert(res.message || "Task deleted successfully!");
    loadTasks();
  })
  .catch(err => {
    console.error(err);
    showError("Failed to delete task");
  });
}


// Function to Update task
function markComplete(uuid) {
  fetch(`${apiBaseUrl}${uuid}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ is_complete: true })
  })
  .then(res => res.json())
  .then(data => {
    showSuccess(data.message || "Task marked as complete!");
    loadTasks();
  })
  .catch(err => {
    console.error(err);
    showError("Failed to update task");
  });
}

function logout() {
  localStorage.removeItem("access_token");
  window.location.href = "/users/login_page/";
}

// Helper functions
function showLoading() {
  // You can implement a loading indicator here
}

function hideLoading() {
  // Hide loading indicator
}

function showSuccess(message) {
  // You can implement a toast notification here
  alert(message);
}

function showError(message) {
  // You can implement error notification here
  alert(message);
}



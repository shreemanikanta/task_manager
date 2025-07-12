const apiBaseUrl = "http://127.0.0.1:8011/task/tasks/";  // adjust to your API
const token = localStorage.getItem("access_token");

document.addEventListener("DOMContentLoaded", function() {
  loadTasks();

  document.getElementById("createTaskBtn").addEventListener("click", createTask);
  document.getElementById("logoutBtn").addEventListener("click", logout);
});


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

# 📚 README.md — Task Management System
## 🚀 Task Management System

A modern Django-based task management application with real-time updates using Django Channels, Celery, and Redis.
It supports JWT-authenticated APIs to create, view, update, and delete tasks — with real-time notifications when tasks become overdue.
Plus, it includes an AI-powered feature to automatically generate smart task summaries using OpenAI’s language models.

## ⚙️ Tech Stack

    * **Backend**: Django, Django REST Framework (DRF)

    * **Real-time**: Django Channels, Redis, Daphne

    * **Async Tasks**: Celery

    * **Database**: SQLite (dev) or PostgreSQL (prod)

    * **Containerization**: Docker & Docker Compose

    * **AI**: OpenAI / OpenRouter for natural language task summaries

## 📌 API Endpoints

All APIs require JWT Authorization: Bearer <access_token> header.
### ✅ 1. Get all tasks

#### GET /task/tasks/

Response:

{
  "status": 200,
  "message": "Successfully fetched",
  "data": [
    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Finish Project Report",
      "description": "Complete the financial section and final proofread.",
      "deadline": "2025-07-14T18:00:00Z",
      "status": "Upcoming"
    }
  ]
}

### ✅ 2. Get single task

#### GET /task/tasks/{uuid}/

Response:

{
  "status": 200,
  "message": "Successfully fetched",
  "data": {
    "uuid": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Finish Project Report",
    "description": "Complete the financial section and final proofread.",
    "deadline": "2025-07-14T18:00:00Z",
    "status": "Upcoming"
  }
}

### ✅ 3. Create new task

#### POST /task/tasks/

Request:

{
  "title": "Prepare Presentation",
  "description": "Slides for the quarterly meeting",
  "deadline": "2025-07-15T12:00:00Z"
}

Response:

{
  "status": 201,
  "message": "Task created successfully.",
  "data": {
    "uuid": "456e7890-e89b-12d3-a456-426614174999",
    "title": "Prepare Presentation",
    "description": "Slides for the quarterly meeting",
    "deadline": "2025-07-15T12:00:00Z",
    "status": "Upcoming"
  }
}

### ✅ 4. Update task

#### PATCH /task/tasks/{uuid}/

Request:

{
  "is_complete": true
}

Response:

{
  "status": 200,
  "message": "Task updated successfully.",
  "data": {
    "uuid": "456e7890-e89b-12d3-a456-426614174999",
    "status": "Completed"
  }
}

### ✅ 5. Delete task

#### DELETE /task/tasks/{uuid}/

Response:

{
  "status": 200,
  "message": "Task deleted successfully."
}

### ✅ 6. Generate Task Summary (AI)

#### POST /task/generate_summary/

Request:

{
  "title": "Prepare a detailed marketing strategy for Q4"
}

Response:

{
  "status": 200,
  "message": "Summary generated successfully",
  "data": {
    "summary": "Draft a comprehensive plan covering social media ads, influencer outreach, and lead generation campaigns for Q4."
  }
}

## 🔔 WebSocket Notifications

    When a task deadline passes and is still incomplete, the system sends a real-time WebSocket update.

    Your front-end connects to:

    ws://<your_domain>/ws/tasks/<user_uuid>/

And listens for:

    {
      "uuid": "123e4567-e89b-12d3-a456-426614174000",
      "status": "Missed"
    }

## 🧠 AI Innovation Feature
### ✨ AI-Powered Task Summary

What it is:
A smart AI feature that automatically generates clear, concise task summaries based on the task title.

Why it’s valuable:
Users often struggle to write clear task descriptions. By generating summaries with AI, they save time and keep task details clear and consistent.

Technical implementation:

    The backend uses an external LLM (OpenAI / OpenRouter) via an HTTP API call.

    The user sends a task title to /task/generate_summary/.

    The server forwards this to the OpenRouter API, processes the AI response, and returns the generated summary.

How to use it:

    Send a POST request to /task/generate_summary/ with the title field.

    Get the improved summary from the summary field in the response.

    Use this as the description when creating or updating your task!

## ⚙️ Development Setup

# 1. Clone repo
git clone <your-repo-url>
cd <your-project>

# 2. Build and run Docker
docker-compose up --build

# 3. Apply migrations
docker-compose exec daphne python manage.py migrate

# 4. Create superuser
docker-compose exec daphne python manage.py createsuperuser

# 5. Collect static files
docker-compose exec daphne python manage.py collectstatic --noinput

# 6. Access:
# API: http://127.0.0.0:port/

## 🔑 Environment Variables

#### Create a .env file with:

Sample .env file was attached

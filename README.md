# Course Platform API

A Node.js and Express backend for an online course platform with role-based access for admins, teachers, and students.

The API supports authentication, course creation, session management, quiz questions, student enrollment, media uploads, and a simple admin dashboard.

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Joi
- Multer

## Features

- User registration and login
- Role-based authorization for `admin`, `teacher`, and `student`
- Course creation and management by teachers
- Course subscription by students
- Session management with video or PDF content
- Session quizzes and submission flow
- Enrollment tracking with completed sessions
- Admin statistics endpoint
- File uploads for profile pictures, thumbnails, videos, and PDFs

## Project Structure

```text
src/
  app.controller.js
  main.js
  common/
    middleware/
    utils/
  database/
    connection.js
    model/
  module/
    adminDashboard/
    auth/
    courses/
    enrollment/
    questions/
    sessions/
    users/
```

## Getting Started

### Prerequisites

- Node.js 18+ recommended
- MongoDB running locally on `mongodb://localhost:27017`

### Installation

```bash
npm install
```

### Run the Project

```bash
npm start
```

The server starts on:

```text
http://localhost:3000
```

## Database

The app currently connects directly to:

```text
mongodb://localhost:27017/course-platform-db
```

This is configured in `src/database/connection.js`.

## File Uploads

Uploaded files are stored locally under:

- `uploads/images`
- `uploads/videos`
- `uploads/pdf`

Supported file types:

- `image/jpeg`
- `image/png`
- `video/mp4`
- `video/webm`
- `video/mkv`
- `application/pdf`

Maximum upload size:

- `500MB`

## Authentication

Login returns a JWT token.

Protected routes expect a custom header named `token` in this format:

```text
token: bearer <jwt-token>
```

Note: this project uses a custom `token` header, not the standard `Authorization` header.

## API Base URL

```text
/api/v1
```

## API Reference

All routes are prefixed with:

```text
/api/v1
```

For protected routes, send:

```text
token: bearer <jwt-token>
```

### Auth

#### `POST /api/v1/auth/register`

Creates a new user account. Supports profile picture upload.

Request type:

- `multipart/form-data`

Form-data fields:

- `name` required, string, 2 to 50 chars
- `email` required, valid email
- `password` required, 8+ chars and must include at least one number
- `role` optional, one of `student`, `teacher`, `admin`
- `cardNumber` optional, exactly 16 chars
- `profilePicture` optional, file upload

Notes:

- If `role` is `teacher`, `cardNumber` is required by the service logic.
- Uploaded profile pictures are stored under `uploads/images`.

#### `POST /api/v1/auth/login`

Authenticates a user and returns a JWT token.

Request type:

- `application/json`

Body:

```json
{
  "email": "user@example.com",
  "password": "test1234"
}
```

### Users

#### `GET /api/v1/users/`

Returns all users. Admin only.

Request body:

- No body

#### `GET /api/v1/users/:id`

Returns one user by id. Admin only.

Request body:

- No body

#### `PATCH /api/v1/users/:id/ban`

Sets `isActive` to `false`. Admin only.

Request body:

- No body

#### `PATCH /api/v1/users/:id/unban`

Sets `isActive` to `true`. Admin only.

Request body:

- No body

#### `DELETE /api/v1/users/:id`

Deletes a user by id. Admin only.

Request body:

- No body

### Courses

#### `GET /api/v1/courses/`

Returns paginated courses and supports filtering.

Query params:

- `q` optional, searches in title and description
- `category` optional, exact category match
- `isFree` optional, set to `true` to filter free courses
- `page` optional, default `1`
- `limit` optional, default `10`

Request body:

- No body

#### `GET /api/v1/courses/my`

Returns courses created by the logged-in teacher.

Request body:

- No body

#### `GET /api/v1/courses/:id`

Returns one course by id.

Request body:

- No body

#### `POST /api/v1/courses/`

Creates a new course. Teacher only. Supports thumbnail upload.

Request type:

- `multipart/form-data`

Form-data fields:

- `title` required, string, 3 to 120 chars
- `description` required, string, 10 to 2000 chars
- `price` required, number, minimum `0`
- `category` required, string, 3 to 50 chars
- `thumbnail` optional, image file

Notes:

- The logged-in teacher becomes the course owner automatically.
- Uploaded thumbnails are stored under `uploads/images`.

#### `PUT /api/v1/courses/:id`

Updates a course owned by the logged-in teacher.

Request type:

- `application/json`

Body:

```json
{
  "title": "Updated Course Title",
  "description": "Updated course description",
  "price": 150,
  "category": "backend",
  "thumbnail": "https://example.com/image.png"
}
```

Notes:

- All fields are optional, but at least one must be sent.
- Even though the service checks `req.file`, this route does not currently use the upload middleware, so updates should be sent as JSON.

#### `DELETE /api/v1/courses/:id`

Deletes a course if the logged-in teacher owns it.

Request body:

- No body

#### `POST /api/v1/courses/:id/subscribe`

Enrolls the logged-in student in a course and creates a transaction record.

Request type:

- `application/json`

Body:

```json
{
  "cardNumber": "1234567812345678"
}
```

Notes:

- `cardNumber` is required only when the course has a price.
- Free courses can be subscribed to without a card number.

#### `GET /api/v1/courses/:courseId/sessions`

Returns the course with its populated sessions.

Request body:

- No body

Notes:

- The route allows `teacher` and `student`, but the current service logic checks student enrollment first and also checks teacher ownership.
- In practice, students must be enrolled, and teachers can only access their own course.

#### `POST /api/v1/courses/:courseId/sessions`

Adds a new session to a course owned by the logged-in teacher. Supports video or PDF upload.

Request type:

- `multipart/form-data`

Form-data fields:

- `title` required, string, 3 to 120 chars
- `contentType` required, `video` or `pdf`
- `duration` required, string
- `passingScoreThreshold` required, number from `0` to `100`
- `filePath` optional, uploaded file

Notes:

- Session order is generated automatically.
- If the uploaded file is a video, it is stored under `uploads/videos`.
- If the uploaded file is a PDF, it is stored under `uploads/pdf`.

### Sessions

#### `GET /api/v1/sessions/:id`

Returns one session by id.

Request body:

- No body

#### `PUT /api/v1/sessions/:id`

Updates a session if the logged-in teacher owns the parent course.

Request type:

- `application/json`

Body:

```json
{
  "title": "Session 1",
  "contentType": "video",
  "duration": "15 min"
}
```

Notes:

- There is no Joi validation on this route.
- `passingScoreThreshold` and file upload are not updated here.

#### `DELETE /api/v1/sessions/:id`

Deletes a session, removes its local uploaded file if it exists, and reorders remaining sessions in the course.

Request body:

- No body

#### `GET /api/v1/sessions/:id/stream`

Streams the session video file.

Request body:

- No body

Notes:

- Teacher or student can access the route.
- Students must be enrolled in the course.
- If the session is not the first one, the previous session must already be completed.
- This route also supports the `Range` header for video streaming.

#### `GET /api/v1/sessions/:id/pdf`

Returns the session PDF file.

Request body:

- No body

Notes:

- Teacher or student can access the route.
- Students must be enrolled in the course.
- If the session is not the first one, the previous session must already be completed.
- The session must have `contentType` set to `pdf`.

#### `POST /api/v1/sessions/:sessionId/questions`

Creates a quiz question for a session owned by the logged-in teacher.

Request type:

- `application/json`

Body:

```json
{
  "text": "What is Node.js?",
  "options": ["Runtime", "Database", "Browser", "Framework"],
  "correctAnswerIndex": 1
}
```

Notes:

- `options` must contain from 2 to 5 items.
- The code subtracts `1` before storing the answer index, so this endpoint behaves as if the correct answer is expected in 1-based numbering.

#### `GET /api/v1/sessions/:sessionId/questions`

Returns all questions for a session without exposing the correct answer.

Request body:

- No body

Notes:

- The user must be enrolled in the related course.

#### `POST /api/v1/sessions/:sessionId/submit`

Submits quiz answers for a session and calculates the score.

Request type:

- `application/json`

Body:

```json
{
  "answers": [1, 2, 3]
}
```

Notes:

- Student only.
- Answer values are compared using 1-based numbering.
- The student must be enrolled in the course.
- The same session cannot be submitted twice after completion.
- If the score is greater than or equal to `passingScoreThreshold`, the session id is added to `completedSessions`.

### Questions

#### `PUT /api/v1/questions/:id`

Updates a question if the logged-in teacher owns the related session.

Request type:

- `application/json`

Body:

```json
{
  "text": "Updated question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswerIndex": 2
}
```

Notes:

- All fields are optional.
- If `correctAnswerIndex` is sent, the code subtracts `1` before storing it.
- There is no Joi validation on this route.

#### `DELETE /api/v1/questions/:id`

Deletes a question if the logged-in teacher owns the related session.

Request body:

- No body

### Enrollments

#### `GET /api/v1/enrollments/my`

Returns all courses the logged-in student is enrolled in.

Request body:

- No body

### Admin Dashboard

#### `GET /api/v1/admin/stats`

Returns summary statistics for admins.

What it returns:

- total users
- total transactions
- total courses
- total revenue aggregation

Request body:

- No body

## Roles Overview

- `admin`: manage users and view platform stats
- `teacher`: create courses, upload sessions, and manage questions
- `student`: subscribe to courses, access enrolled content, and submit quizzes

## Notes

- Session access is gated by enrollment status.
- Students must pass a session quiz before moving to the next session when previous completion is required.
- Static uploaded files are served from `/uploads`.
- There is currently no environment variable configuration; connection strings and secrets are hardcoded in the source.

## Scripts

```bash
npm start
```

Starts the server with file watching using `node --watch src/main.js`.

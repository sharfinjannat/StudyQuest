# StudyQuest Backend

A Node.js backend for the StudyQuest application with MongoDB database.

## Frontend Preview

![StudyQuest Frontend](frontend-preview.png)

## Features

- Department and Semester Management
- Course Management
- Question Paper Upload and Approval System
- User Management (Student/Admin roles)
- RESTful API with Express.js

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/sharfin4088-lang/StudyQuest.git
cd StudyQuest
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/studyquest
SESSION_SECRET=your-secret-key
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Departments
- `GET /api/departments` - Get all departments
- `POST /api/departments` - Create department (auto-generates 8 semesters)
- `DELETE /api/departments/:id` - Delete department

### Semesters
- `GET /api/semesters/:departmentCode` - Get semesters for department

### Courses
- `GET /api/courses?semesterId=<id>` - Get courses for semester
- `GET /api/semesters/:id/courses` - Alternative route for courses

### Question Papers
- `POST /api/papers` - Upload question paper
- `GET /api/papers/pending` - Get pending papers
- `PUT /api/papers/:id/approve` - Approve paper
- `DELETE /api/papers/:id` - Delete paper

### Admin
- `GET /api/admin/stats` - Get dashboard statistics

## Database Schema

### User
- name (String, required)
- email (String, required, unique)
- role (String: 'student' | 'admin', default: 'student')

### Department
- name (String, required)
- code (String, required)
- image (String)

### Semester
- number (Number, required)
- departmentCode (String, required)
- departmentId (ObjectId, required)

### Course
- title (String, required)
- code (String, required)
- departmentCode (String, required)
- semesterNumber (Number, required)

### QuestionPaper
- title (String, required)
- driveLink (String, required)
- type (String, required)
- year (String, required)
- uploaderName (String, required)
- departmentCode (String, required)
- semesterNumber (Number, required)
- status (String: 'pending' | 'approved', default: 'pending')

## Deployment

### Heroku
1. Install Heroku CLI
2. Login to Heroku: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables: `heroku config:set MONGO_URI=your-mongodb-uri`
5. Deploy: `git push heroku main`

### Vercel
1. Install Vercel CLI
2. Login: `vercel login`
3. Deploy: `vercel --prod`

### Railway
1. Install Railway CLI
2. Login: `railway login`
3. Deploy: `railway up`

## Environment Variables

- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `SESSION_SECRET` - Session secret key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
<img width="1873" height="882" alt="image" src="https://github.com/user-attachments/assets/87ef6e56-99bd-45ce-8f0f-25141b49aeea" />


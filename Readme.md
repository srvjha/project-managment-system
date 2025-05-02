# Project Managment System

## Description

This project is a robust backend API server built with Node.js and TypeScript, designed to manage projects, tasks, subtasks, and notes with comprehensive user authentication and role-based permissions. It leverages Express.js as the web framework and MongoDB with Mongoose for data persistence. The application supports file uploads using Multer and Cloudinary for media storage and management. It also integrates email notifications via Nodemailer and Mailgen. Validation is handled through express-validator and Zod, while Winston is used for logging. The project emphasizes code quality with tools like Prettier, ESLint, and Husky, and supports smooth development with ts-node-dev for hot reloading. This backend serves as a scalable and secure foundation for project management applications

---

## Technologies Used

This project uses the following main technologies and libraries:

- **Node.js** with **Express** for the backend server
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** for database management
- **Authentication** with **jsonwebtoken** and **bcryptjs**
- **File Uploads** handled by **Multer**
- **Cloudinary** for media storage and management
- **Emailing** with **Nodemailer** and **Mailgen**
- **Validation** using **express-validator** and **Zod**
- **Logging** with **Winston**
- **Middleware** utilities: **cors**, **cookie-parser**, **dotenv**
- **Code Quality** tools: **Prettier**, **ESLint**, **Husky** (if used)
- **Development** with **ts-node-dev** for hot reloading

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/)
- Cloudinary credentials (for image upload)
- Email SMTP config (for mail services)

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/srvjha/project-managment-system
   cd your-repo
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure environment variables as needed (e.g., create a `.env` file based on `env.sample`).

4. Start the application:
   ```bash
   npm start
   # or
   yarn start
   ```

---

## Project Structure

```
/project-nest
│── logs/                  # Winston log files (error.log, combined.log)
│── public/
│   └── uploads/           # Temporary storage for uploaded files (via Multer)
│── src/
│   ├── controllers/       # Request handlers and business logic
│   ├── middleware/        # Express middleware (auth, error handler, etc.)
|   ├── models/            # Mongoose models (Project, User, Notes, etc.)
│   ├── routes/            # API routes
│   ├── utils/             # Utility functions (CustomError, permissions)
|   ├── validators/        # Zod schemas and validation logic
|   ├── config/            # Configs for DB, cloudinary, logger, etc.
│   ├── types.d.ts         # Global/custom TypeScript declarations
│   ├── app.ts             # Express app setup (middlewares, routes)
│   ├── index.ts           # Entry point — starts server and connects to DB
├── .env.example           # Sample environment configuration
├── .gitignore             # Files and folders to exclude from Git
├── package.json           # Project dependencies and metadata
├── package-lock.json      # Lockfile for dependency versions
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview and documentation
```

## Features

- User authentication and authorization
- Project, task, and subtask management
- File uploads and media handling via Cloudinary
- Email notifications
- Real-time validations and error handling
- Role-based permissions
- Logging and monitoring

---

## Contribution Guidelines

Contributions are welcome! Please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes with clear messages.
4. Push your branch and open a pull request.
5. Ensure your code passes tests and follows the coding style.

---

## Contact Information

For questions or support, please contact:

- [jhasaurav0209001@gmail.com](mailto:jhasaurav0209001@gmail.com)
- [https://x.com/J_srv001](https://x.com/J_srv001)

---

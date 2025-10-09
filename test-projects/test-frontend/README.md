# RnD Frontend

Next.js 15 frontend application with TypeScript, Tailwind CSS, and Redux Toolkit (RTK Query). Connects to the NestJS backend for user management.

## 🚀 Prerequisites

- [Node.js](https://nodejs.org/) (>= 20)
- [Yarn](https://yarnpkg.com/)
- Running backend server (see [../rnd-backend/README.md](../rnd-backend/README.md))

## 🛠 Setup & Run

1. **Install dependencies**
   ```sh
   yarn install
   ```

2. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```sh
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

3. **Start the development server**
   ```sh
   yarn dev
   ```

## 🧪 Accessing the Application

The application will be running at:
```sh
http://localhost:3001
```
(or the next available port if 3001 is in use)

## 📁 Available Pages

- **Home**: `http://localhost:3001/` - Landing page with navigation
- **Users List**: `http://localhost:3001/users` - View all users
- **Create User**: `http://localhost:3001/users/create` - Create a new user
- **User Details**: `http://localhost:3001/users/:id` - View user details
- **Edit User**: `http://localhost:3001/users/:id/edit` - Edit existing user

## 🔨 Additional Commands

- **Build for production**
  ```sh
  yarn build
  ```

- **Start production server**
  ```sh
  yarn start
  ```

- **Run ESLint**
  ```sh
  yarn lint
  ```

- **Format code with Prettier**
  ```sh
  yarn format
  ```

## 🔗 Backend Integration

This frontend requires the backend server to be running. Follow these steps:

1. Navigate to the backend directory and start the services:
   ```sh
   cd ../rnd-backend
   docker compose up -d
   yarn install
   yarn prisma migrate reset
   yarn start:dev
   ```

2. Ensure the backend is running on `http://localhost:3000`

3. Return to the frontend directory and start the app:
   ```sh
   cd ../rnd-frontend
   yarn dev
   ```

## 📚 Documentation

For detailed information about the project architecture, folder structure, and development guidelines, see [CLAUDE-FE.md](CLAUDE-FE.md).

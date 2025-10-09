# RnD Backend

NestJS + Prisma backend with PostgreSQL (Docker).

## 🚀 Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (>= 20)
- [Yarn](https://yarnpkg.com/)

## 🛠 Setup & Run

1. **Start PostgreSQL via Docker**
   ```sh
   docker compose up -d
   ```
2. **Install dependencies**
   ```sh
   yarn install
   ```
3. **Reset and migrate the database**
   ```sh
   yarn prisma migrate reset
   ```
4. **Push schema to database (in case you only want schema sync)**
   ```sh
   yarn prisma db push
   ```
5. **Start the NestJS app (development mode)**
   ```sh
   yarn start:dev
   ```

## 🧪 Testing the API

The server will be running at:
   ```sh
   http://localhost:3000
   ```


# RnD Project

Full-stack application with NestJS backend, Next.js frontend, and PostgreSQL database.

## 📁 Project Structure

```
rnd/
├── test-projects/test-backend/          # NestJS + Prisma backend
├── test-projects/test-frontend/         # Next.js + RTK Query frontend
├── boot.sh              # Script to start all services
├── stop.sh               # Script to stop all services
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (>= 20)
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) & Docker Compose
- **Git Bash** (for Windows users) - Required to run shell scripts

### Setup

> **Windows Users**: Use **Git Bash** terminal for all commands below. The scripts might not work in PowerShell or Command Prompt.

1. **Make scripts executable** (first time only, Git Bash required)
   ```bash
   chmod +x boot.sh stop.sh
   chmod +x test-projects/test-backend/scripts/*.sh
   ```

2. **Start all services**
   ```bash
   ./boot.sh
   ```

3. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - Database: PostgreSQL on port 5433

4. **Stop all services**
   ```bash
   ./stop.sh
   ```

## 📜 Scripts Usage

### `boot.sh`

Starts all services in the correct order:

1. **PostgreSQL Database** (Docker) - port 5433
2. **Backend Server** (NestJS) - http://localhost:3000
   - Installs dependencies if needed
   - Runs database migrations
   - Starts in background
3. **Frontend Server** (Next.js) - http://localhost:3001
   - Installs dependencies if needed
   - Starts in background

**Features:**
- ✨ Color-coded output
- 📊 Progress indicators
- ⚠️ Error handling
- 💾 Saves PIDs for cleanup
- 📝 Creates log files (`backend.log`, `frontend.log`)
- 📋 Shows service URLs and helpful commands

### `stop.sh`

Stops all services gracefully:

1. **Frontend Server** - kills process by PID and port 3001
2. **Backend Server** - kills process by PID and port 3000
3. **PostgreSQL Database** - stops Docker containers
4. **Cleanup** - removes PID files and logs

## 📊 Monitoring

View live logs (use Git Bash on Windows):

```bash
# Backend logs
tail -f backend.log

# Frontend logs
tail -f frontend.log
```

## 📚 Documentation

- **Backend**: See [test-projects/test-backend/README.md](test-projects/test-backend/README.md) and [test-projects/test-backend/CLAUDE-BE.md](test-projects/test-backend/CLAUDE-BE.md)
- **Frontend**: See [test-projects/test-frontend/README.md](test-projects/test-frontend/README.md) and [test-projects/test-frontend/CLAUDE-FE.md](test-projects/test-frontend/CLAUDE-FE.md)

## 🛠 Manual Setup (Alternative)

If you prefer to run services manually:

### Backend

```bash
# Use Git Bash on Windows
cd test-projects/test-backend
docker compose up -d
yarn install
yarn prisma migrate reset
yarn start:dev
```

### Frontend

```bash
cd test-projects/test-frontend
yarn install
yarn dev
```

## 🧹 Troubleshooting

### Windows Users: Command Not Working

If you see errors like `command not found` or `permission denied`:
- Make sure you're using **Git Bash**, not PowerShell or Command Prompt
- Run the `chmod` commands from the Setup section
- Right-click Git Bash and "Run as Administrator" if needed

### Ports Already in Use

If ports 3000, 3001, or 5433 are already in use:

**Linux/Mac/Git Bash:**
```bash
# Check what's using the port
lsof -ti:3000
lsof -ti:3001
lsof -ti:5433

# Kill the process
kill -9 <PID>
```

**Windows (PowerShell):**
```powershell
# Check what's using the port
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :5433

# Kill the process
taskkill /PID <PID> /F
```

### Services Won't Start

1. Check if Docker is running
2. Ensure all dependencies are installed
3. Check log files for errors (use Git Bash on Windows):
   ```bash
   cat backend.log
   cat frontend.log
   ```

### Clean Restart

Use Git Bash on Windows:
```bash
./stop.sh
docker system prune -f  # Clean Docker resources
./boot.sh
```

## 🏗️ Tech Stack

- **Backend**: NestJS, Prisma, PostgreSQL
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, RTK Query
- **Database**: PostgreSQL (Docker)
- **Package Manager**: Yarn

### 📦 Prisma Installation + PostgreSQL Client

# Install Prisma CLI (dev dependency)
npm install prisma@6.2.1 --save-dev

# Install Prisma Client (application dependency)
npm install @prisma/client@6.2.1

# 📁 Initialize Prisma (Run only if prisma/ folder does NOT exist)
npx prisma init

# Generate client
npx prisma generate

# 🛠 Push Schema to Database (Migration)
npx prisma migrate dev --name init

# .env  create database on pgAdmin first and bring those values password,port,database
DATABASE_URL="postgresql://postgres:password@localhost:port/database"
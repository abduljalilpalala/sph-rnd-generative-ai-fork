import { PrismaClient, TaskStatus, ProjectRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      email: 'john.doe@example.com',
      name: 'John Doe',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane.smith@example.com' },
    update: {},
    create: {
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'bob.wilson@example.com' },
    update: {},
    create: {
      email: 'bob.wilson@example.com',
      name: 'Bob Wilson',
    },
  });

  console.log('Created users:', { user1, user2, user3 });

  // Create projects
  const project1 = await prisma.project.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'E-Commerce Platform',
      description: 'Building a modern e-commerce platform with Next.js and NestJS',
      ownerId: user1.id,
      members: {
        create: [
          { userId: user1.id, role: ProjectRole.OWNER },
          { userId: user2.id, role: ProjectRole.MEMBER },
          { userId: user3.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  const project2 = await prisma.project.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Mobile App Development',
      description: 'React Native app for iOS and Android',
      ownerId: user2.id,
      members: {
        create: [
          { userId: user2.id, role: ProjectRole.OWNER },
          { userId: user1.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  const project3 = await prisma.project.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Analytics Dashboard',
      description: 'Real-time analytics and reporting dashboard',
      ownerId: user3.id,
      members: {
        create: [
          { userId: user3.id, role: ProjectRole.OWNER },
          { userId: user1.id, role: ProjectRole.MEMBER },
          { userId: user2.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  console.log('Created projects:', { project1, project2, project3 });

  // Create tasks for E-Commerce Platform (Project 1)
  const tasks1 = await Promise.all([
    // OPEN tasks
    prisma.task.create({
      data: {
        title: 'Design database schema',
        description: 'Create ERD and define relationships for products, orders, and users',
        status: TaskStatus.OPEN,
        projectId: project1.id,
        createdById: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup authentication system',
        description: 'Implement JWT-based auth with refresh tokens',
        status: TaskStatus.OPEN,
        projectId: project1.id,
        createdById: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create product catalog API',
        description: 'REST endpoints for managing products and categories',
        status: TaskStatus.OPEN,
        projectId: project1.id,
        createdById: user2.id,
      },
    }),

    // IN_PROGRESS tasks
    prisma.task.create({
      data: {
        title: 'Build shopping cart functionality',
        description: 'Add/remove items, calculate totals, apply discounts',
        status: TaskStatus.IN_PROGRESS,
        projectId: project1.id,
        createdById: user2.id,
        assignments: {
          create: [{ userId: user2.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Implement payment gateway integration',
        description: 'Integrate Stripe for payment processing',
        status: TaskStatus.IN_PROGRESS,
        projectId: project1.id,
        createdById: user1.id,
        assignments: {
          create: [{ userId: user3.id }],
        },
      },
    }),

    // FOR_REVIEW tasks
    prisma.task.create({
      data: {
        title: 'User profile management',
        description: 'Edit profile, change password, view order history',
        status: TaskStatus.FOR_REVIEW,
        projectId: project1.id,
        createdById: user3.id,
        assignments: {
          create: [{ userId: user1.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Product search and filtering',
        description: 'Full-text search with filters for price, category, and ratings',
        status: TaskStatus.FOR_REVIEW,
        projectId: project1.id,
        createdById: user1.id,
        assignments: {
          create: [{ userId: user2.id }],
        },
      },
    }),

    // CLOSED tasks
    prisma.task.create({
      data: {
        title: 'Setup project structure',
        description: 'Initialize monorepo with frontend and backend',
        status: TaskStatus.CLOSED,
        projectId: project1.id,
        createdById: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Configure CI/CD pipeline',
        description: 'Setup GitHub Actions for automated testing and deployment',
        status: TaskStatus.CLOSED,
        projectId: project1.id,
        createdById: user2.id,
      },
    }),
  ]);

  // Create tasks for Mobile App (Project 2)
  const tasks2 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup React Native project',
        description: 'Initialize project with Expo',
        status: TaskStatus.OPEN,
        projectId: project2.id,
        createdById: user2.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design app navigation',
        description: 'Implement React Navigation with bottom tabs',
        status: TaskStatus.IN_PROGRESS,
        projectId: project2.id,
        createdById: user2.id,
        assignments: {
          create: [{ userId: user1.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create login screen',
        description: 'Design and implement authentication UI',
        status: TaskStatus.FOR_REVIEW,
        projectId: project2.id,
        createdById: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Setup push notifications',
        description: 'Configure Firebase Cloud Messaging',
        status: TaskStatus.CLOSED,
        projectId: project2.id,
        createdById: user2.id,
      },
    }),
  ]);

  // Create tasks for Analytics Dashboard (Project 3)
  const tasks3 = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Setup data visualization library',
        description: 'Choose and configure Chart.js or D3.js',
        status: TaskStatus.OPEN,
        projectId: project3.id,
        createdById: user3.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Create real-time data pipeline',
        description: 'Implement WebSocket connection for live updates',
        status: TaskStatus.IN_PROGRESS,
        projectId: project3.id,
        createdById: user3.id,
        assignments: {
          create: [{ userId: user1.id }, { userId: user2.id }],
        },
      },
    }),
    prisma.task.create({
      data: {
        title: 'Build dashboard layouts',
        description: 'Create responsive grid layouts for charts and widgets',
        status: TaskStatus.FOR_REVIEW,
        projectId: project3.id,
        createdById: user1.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Design color scheme',
        description: 'Choose consistent color palette for charts',
        status: TaskStatus.CLOSED,
        projectId: project3.id,
        createdById: user3.id,
      },
    }),
  ]);

  console.log('Created tasks:', {
    project1Tasks: tasks1.length,
    project2Tasks: tasks2.length,
    project3Tasks: tasks3.length,
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

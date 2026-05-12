import { PrismaClient } from '@/packages/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@devnarrate.com' },
    update: {},
    create: {
      name: 'demodev',
      stageName: 'demodev',
      email: 'demo@devnarrate.com',
      emailVerified: true,
      description: 'Demo Developer - Building awesome projects and sharing knowledge with the community.',
      image: null,
      socialLinks: {
        github: 'https://github.com/demodev',
        twitter: 'https://twitter.com/demodev',
        linkedin: 'https://linkedin.com/in/demodev',
      },
      contributionUrl: null,
    },
  });

  console.log('Demo user created:', demoUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

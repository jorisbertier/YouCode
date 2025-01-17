import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const main = async () => {
  const users: any[] = [];

  // Création de 10 utilisateurs
  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        createdAt: faker.date.past(),
        // Création de l'utilisateur sans 'createdCourses'
      },
    });

    // Création d'un cours pour chaque utilisateur
    const course = await prisma.course.create({
      data: {
        name: faker.lorem.words(3),
        createdAt: faker.date.past(),
        presentation: faker.lorem.paragraph(),
        image: faker.image.url(),
        creatorId: user.id, // L'utilisateur est le créateur du cours
      },
    });

    // Création de leçons pour chaque cours
    await prisma.lesson.createMany({
      data: [
        {
          name: faker.lorem.words(3),
          content: faker.lorem.paragraph(),
          rank: 'aaaaaa',
          courseId: course.id,
        },
        {
          name: faker.lorem.words(3),
          content: faker.lorem.paragraph(),
          rank: 'aaaaab',
          courseId: course.id,
        },
      ],
    });

    // Ajouter l'utilisateur à la relation avec le cours
    await prisma.courseOnUser.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
    });

    // Ajout de l'utilisateur au tableau
    users.push(user);
  }

  // Link users to random courses (100 relations)
  const courses = await prisma.course.findMany();

  for (const course of courses) {
    const randomUsers = faker.helpers.arrayElements(users, 3); // Choisir 3 utilisateurs au hasard

    for (const user of randomUsers) {
      await prisma.courseOnUser.create({
        data: {
          userId: user.id,
          courseId: course.id,
        },
      });
    }
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create sample navigation
  const booksNav = await prisma.navigation.upsert({
    where: { slug: 'books' },
    update: {},
    create: {
      title: 'Books',
      slug: 'books',
      lastScrapedAt: new Date(),
    },
  });

  console.log('Created navigation:', booksNav.title);

  // Create sample categories
  const fiction = await prisma.category.upsert({
    where: { 
      navigationId_slug: {
        navigationId: booksNav.id,
        slug: 'fiction'
      }
    },
    update: {},
    create: {
      navigationId: booksNav.id,
      title: 'Fiction',
      slug: 'fiction',
      productCount: 0,
      lastScrapedAt: new Date(),
    },
  });

  const nonFiction = await prisma.category.upsert({
    where: { 
      navigationId_slug: {
        navigationId: booksNav.id,
        slug: 'non-fiction'
      }
    },
    update: {},
    create: {
      navigationId: booksNav.id,
      title: 'Non-Fiction',
      slug: 'non-fiction',
      productCount: 0,
      lastScrapedAt: new Date(),
    },
  });

  console.log('Created categories:', fiction.title, nonFiction.title);

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { sourceId: 'sample-1' },
    update: {},
    create: {
      sourceId: 'sample-1',
      categoryId: fiction.id,
      title: 'Sample Book 1',
      author: 'John Doe',
      price: 9.99,
      currency: 'GBP',
      imageUrl: 'https://via.placeholder.com/200x300',
      sourceUrl: 'https://www.worldofbooks.com/sample-1',
      lastScrapedAt: new Date(),
    },
  });

  // Create product detail
  await prisma.productDetail.upsert({
    where: { productId: product1.id },
    update: {},
    create: {
      productId: product1.id,
      description: 'This is a sample book description for testing purposes.',
      ratingsAvg: 4.5,
      reviewsCount: 10,
      publisher: 'Sample Publisher',
      publicationDate: '2024',
      isbn: '1234567890',
      specs: JSON.stringify({
        pages: 300,
        format: 'Paperback',
      }),
    },
  });

  // Create sample reviews
  await prisma.review.createMany({
    data: [
      {
        productId: product1.id,
        author: 'Jane Smith',
        rating: 5,
        text: 'Excellent book! Highly recommended.',
      },
      {
        productId: product1.id,
        author: 'Bob Johnson',
        rating: 4,
        text: 'Good read, enjoyed it.',
      },
    ],
  });

  console.log('Created sample product with details and reviews');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// Configuration for Prisma migrations
export default {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
};

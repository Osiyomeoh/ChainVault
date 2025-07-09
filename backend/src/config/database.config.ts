export const databaseConfig = () => ({
    database: {
      url: process.env.DATABASE_URL,
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'chainvault',
      password: process.env.DB_PASSWORD || 'chainvault123',
      database: process.env.DB_NAME || 'chainvault_dev',
    },
  });
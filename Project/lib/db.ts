// Database configuration and utilities

export const dbConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'tripc',
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
}

// Add your database connection logic here
// For example: Prisma, Supabase, MongoDB, etc.

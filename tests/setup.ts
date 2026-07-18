process.env.NODE_ENV = "test";
process.env.PORT = "5000";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/hr_portfolio_test?schema=public";
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.JWT_ACCESS_SECRET = "test-access-secret-at-least-16";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-16";

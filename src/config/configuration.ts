export default () => ({
    PORT: parseInt(process.env.PORT, 10) || 3000,
    STAGE: process.env.STAGE,
    HOST_API: process.env.HOST_API,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
});

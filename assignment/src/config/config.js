module.exports = {
  development: {
    username: process.env.DB_USER || "user",
    password: process.env.DB_PASS || "userpass",
    database: process.env.DB_NAME || "school_db",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
  },
};

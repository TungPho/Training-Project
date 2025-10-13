const app = require("./src/app");
const { sequelize } = require("./src/models");

const PORT = process.env.PORT || 3000;

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected"))
  .then(() => sequelize.sync())
  .catch((err) => console.error("❌ DB Connection error:", err));

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

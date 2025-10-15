require("dotenv").config();
const express = require("express");
const Database = require("./dbs/db.connect");
const db = Database.getInstance();
const apiRoutes = require("./routes/teacher.business.route");

const app = express();
app.use(express.json());
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Database connected!");

    await db.sequelize.sync();
    console.log("Database Syncronized");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Fail to connect to database", error.message);
    process.exit(1);
  }
})();

module.exports = app;

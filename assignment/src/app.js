require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const apiRoutes = require("./routes/teacher.api.business");

const app = express();
app.use(express.json());
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

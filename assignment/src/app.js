const express = require("express");
require("dotenv").config();

const routes = require("./routes");
const app = express();

app.use(express.json());
app.use("/api", routes);

module.exports = app;

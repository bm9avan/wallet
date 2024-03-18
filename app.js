const express = require("express");
const route = require("./routers");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors("http://localhost:5173/", "*"));
app.use(express.json());
app.use("/api/v1", route);

module.exports = app;

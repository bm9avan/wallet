const mongoose = require("mongoose");

module.exports = function connectDB() {
  const url = process.env.MONGO_URI;

  try {
    mongoose.connect(url);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  const dbConnection = mongoose.connection;

  dbConnection.once("open", () => {
    console.log("Database connected");
  });

  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
};

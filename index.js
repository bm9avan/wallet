const app = require("./app");
const connectMongo = require("./utils/connectMongo");

connectMongo();

app.listen(80, () => {
  console.log("server stared at port 80");
});

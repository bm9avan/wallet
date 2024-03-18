const { Router } = require("express");
const userRoute = require("./user.route");
const router = Router();

router.get("/", (req, res) => res.send("hi welcome to api/v1"));
router.use("/user", userRoute);

module.exports = router;

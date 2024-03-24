const { Router } = require("express");
const userRoute = require("./user.route");
const accountRoute = require("./account.route");
const transactionRoute = require("./transaction.route");
const router = Router();

router.get("/", (req, res) => res.send("hi welcome to api/v1"));
router.use("/user", userRoute);
router.use("/account", accountRoute);
router.use("/send", transactionRoute);

module.exports = router;

const { Router } = require("express");
const { currentUser } = require("../middleware/user.middleware");
const accountController = require("../controllers/account.controller");
const router = Router();

router.get("/balance", currentUser, accountController.balance);

module.exports = router;

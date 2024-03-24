const { Router } = require("express");
const { currentUser } = require("../middleware/user.middleware");
const transactionController = require("../controllers/transaction.controller");
const router = Router();

router.post("/:to", currentUser, transactionController.send);

module.exports = router;

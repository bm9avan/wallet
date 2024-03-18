const { Router } = require("express");
const userController = require("../controllers/user.controller");
const { currentUser } = require("../middleware/user.middleware");
const router = Router();

router.get("/", currentUser, userController.users);
router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.put("/", currentUser, userController.update);
// router.post("/logout",currentUser, userController.logout);
router.put("/password", currentUser, userController.updatePassword);

module.exports = router;

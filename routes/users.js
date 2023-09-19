const express = require("express");
const {
  getAllUsers,
  getUser,
  getLoggedInUser,
  updatePassword,
  deleteUser,
  updateDetails,
  getAllCustomers,
  getAllAdmins,
} = require("../controllers/users");

const { protect } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { checkAuthorization } = require("../middleware/checkAuthorization");

const router = express.Router();

router.get("/", getAllUsers); //done
router.get(
  "/current-user",
  protect,
  checkResourceExists("User"),
  checkAuthorization,
  getLoggedInUser
); //done
router.get("/customers", getAllCustomers); //done
router.get("/admins", getAllAdmins); //done
router.get("/:UserId", checkResourceExists("User"), getUser); //done
router.put(
  "/update-details/:UserId",
  protect,
  checkResourceExists("User"),
  updateDetails
);
router.put(
  "/change-password/:UserId",
  protect,
  checkResourceExists("User"),
  updatePassword
);
router.delete(
  "/:UserId",
  protect,
  checkResourceExists("User"),
  checkAuthorization,
  deleteUser
);

module.exports = router;

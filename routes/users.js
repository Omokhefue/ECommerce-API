const express = require("express");
const {
  getAllUsers,
  getLoggedInUser,
  updatePassword,
  deleteUser,
  updateDetails,
  getAllCustomers,
  getAllAdmins,
  getCustomerOrAdmin,
  getSiteOwner,
  updateCustomerRoleToAdmin,
  blockUser,
  unblockUser,
  getAllUsersPublic,
  getCustomerOrAdminForPublic,
} = require("../controllers/users");

const { protect, authorize } = require("../middleware/auth");
const { checkResourceExists } = require("../middleware/checkResourceExists");
const { checkAuthorization } = require("../middleware/checkAuthorization");

const router = express.Router();

router.get("/", protect, authorize("admin", "customer"), getAllUsers); //done
router.get("/public", getAllUsersPublic); //done
router.get("/current-user", protect, getLoggedInUser); //done
router.get("/customers", getAllCustomers); //done
router.get("/admins", getAllAdmins); //done
router.get(
  "/site-owner/profile",
  protect,
  authorize("site-owner"),
  getSiteOwner
); //done
router.get("/:UserId/profile",protect, checkResourceExists("User"), getCustomerOrAdmin); //done
router.get("/:UserId/profile/public", checkResourceExists("User"), getCustomerOrAdminForPublic); //done

router.post("/block/:UserId", protect, checkResourceExists("User"), blockUser);
router.post(
  "/unblock/:UserId",
  protect,
  checkResourceExists("User"),
  unblockUser
);
router.put(
  "/:UserId/update-details",
  protect,
  checkResourceExists("User"),
  updateDetails
); // done
router.put(
  "/:UserId/update-password",
  protect,
  checkResourceExists("User"),
  checkAuthorization,
  updatePassword
); //done
router.put(
  "/:UserId/update-role",
  protect,
  authorize("customer"),
  checkResourceExists("User"),
  updateCustomerRoleToAdmin
); //done
router.delete("/:UserId", protect, checkResourceExists("User"), deleteUser); //done

module.exports = router;

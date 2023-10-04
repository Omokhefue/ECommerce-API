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
const { advancedResults } = require("../middleware/advancedResults");
const User = require("../models/User");

const router = express.Router();
const passReqToAdvancedResults = (req, res, next) => {
  // Pass req to the advancedResults middleware
  advancedResults(User, {
    _id: { $nin: req.user.blockedUsers },
  })(req, res, next);
};
router.get(
  "/",
  protect,
  authorize("admin", "customer"),
  passReqToAdvancedResults,
  getAllUsers
);
//done
router.get("/public", advancedResults(User), getAllUsersPublic); //done
router.get("/current-user", protect, getLoggedInUser); //done
router.get("/customers", getAllCustomers); //done
router.get("/admins", getAllAdmins); //done
router.get(
  "/site-owner/profile",
  protect,
  authorize("site-owner"),
  getSiteOwner
); //done
router.get(
  "/:userSlug/profile",
  protect,
  checkResourceExists("User"),
  getCustomerOrAdmin
); //done
router.get(
  "/:userSlug/profile/public",
  checkResourceExists("User"),
  getCustomerOrAdminForPublic
); //done

router.post("/block/:uSerSlug", protect, checkResourceExists("User"), blockUser);
router.post(
  "/unblock/:userSlug",
  protect,
  checkResourceExists("User"),
  unblockUser
);
router.put(
  "/:userSlug/update-details",
  protect,
  checkResourceExists("User"),
  updateDetails
); // done
router.put(
  "/:userSlug/update-password",
  protect,
  checkResourceExists("User"),
  checkAuthorization,
  updatePassword
); //done
router.put(
  "/:userSlug/update-role",
  protect,
  authorize("customer"),
  checkResourceExists("User"),
  updateCustomerRoleToAdmin
); //done
router.delete("/:UserId", protect, checkResourceExists("User"), deleteUser); //done

module.exports = router;

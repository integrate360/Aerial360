const { adminLogin, registerAdmin ,adminDashboard} = require("../controller/AdminC.js");
const router = require("express").Router();
// Admin routes
router.post("/admin/login", adminLogin);
router.post("/admin/register", registerAdmin);
router.get("/admin/dashboard/super", adminDashboard);


module.exports = router;

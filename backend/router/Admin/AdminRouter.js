import { Router } from "express";

const AdminRouter = Router();

// Import your controllers here

import {
  addAdmin,
    addUser,
    deleteUser,
    getAllAdminUsernames,
    getAllUsers,
    getDashboardData,
    toggleUserStatus
} from "../../controller/Admin/AdminController.js";
import { validateToken } from "../../middleware/ValidateToken.js";

// Define your routes here
AdminRouter.post("/add", addAdmin);
AdminRouter.get("/usernames", getAllAdminUsernames);
AdminRouter.get("/get-all-users",validateToken,getAllUsers);
AdminRouter.post("/add-user", validateToken, addUser);
AdminRouter.patch("/toggle-status/:id",validateToken,toggleUserStatus)
AdminRouter.delete("/delete-user/:userId",validateToken,deleteUser)
AdminRouter.get("/dashboard",validateToken,getDashboardData) // Assuming you have an addUser function
// Export the router
export default AdminRouter;
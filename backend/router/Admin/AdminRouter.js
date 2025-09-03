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

import {
  createConfig,
  getConfigs,
  updateConfig,
  deleteConfig
} from "../../controller/Admin/modelConfigController.js";

// Import admin dashboard routes
import AdminDashboard from "./AdminDashboard.js";

// Define your routes here
AdminRouter.post("/add", addAdmin);
AdminRouter.get("/usernames", getAllAdminUsernames);
AdminRouter.get("/get-all-users",validateToken,getAllUsers);
AdminRouter.post("/add-user", validateToken, addUser);
AdminRouter.patch("/toggle-status/:id",validateToken,toggleUserStatus)
AdminRouter.delete("/delete-user/:userId",validateToken,deleteUser)

// Model Config routes
AdminRouter.post("/model-config", validateToken, createConfig);
AdminRouter.get("/model-configs", validateToken, getConfigs);
AdminRouter.put("/model-config/:id", validateToken, updateConfig);
AdminRouter.delete("/model-config/:id", validateToken, deleteConfig);

AdminRouter.get("/dashboard",validateToken,getDashboardData) // Legacy route for backward compatibility

// Admin Dashboard CRUD routes
AdminRouter.use("/dashboards", validateToken, AdminDashboard);

// Export the router
export default AdminRouter;

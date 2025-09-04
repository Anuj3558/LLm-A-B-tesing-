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
    toggleUserStatus,
    updateUser
} from "../../controller/Admin/AdminController.js";
import { validateToken } from "../../middleware/ValidateToken.js";
import { AddAdminModelConfig, deleteModelConfig, GetAllAdminModelsRaw, toggleModelStatus, updateModelConfig, updatePlatformConfig } from "../../controller/Admin/modelConfigController.js";

// import {
//   createConfig,
//   getConfigs,
//   updateConfig,
//   deleteConfig
// } from "../../controller/Admin/modelConfigController.js";

// Define your routes here
AdminRouter.post("/add", addAdmin);
AdminRouter.get("/usernames", getAllAdminUsernames);
AdminRouter.get("/get-all-users",validateToken,getAllUsers);
AdminRouter.post("/add-user", validateToken, addUser);
AdminRouter.patch("/toggle-status/:id",validateToken,toggleUserStatus)
AdminRouter.delete("/delete-user/:userId",validateToken,deleteUser)

// Model Config routes
 AdminRouter.post("/add-model", validateToken, AddAdminModelConfig);
 AdminRouter.get("/models-raw",validateToken,GetAllAdminModelsRaw)
// AdminRouter.get("/model-configs", validateToken, getConfigs);
// AdminRouter.put("/model-config/:id", validateToken, updateConfig);
// AdminRouter.delete("/model-config/:id", validateToken, deleteConfig);
AdminRouter.put('/models/:modelConfigId',validateToken, updateModelConfig);

// PUT /api/admin/models/:modelConfigId/toggle - Toggle model active status
AdminRouter.put('/models/:modelConfigId/toggle',validateToken, toggleModelStatus);

// DELETE /api/admin/models/:modelConfigId - Delete model configuration
AdminRouter.delete('/models/:modelConfigId',validateToken, deleteModelConfig);

// PUT /api/admin/platform-config - Update platform configuration
AdminRouter.put('/platform-config',validateToken, updatePlatformConfig);
AdminRouter.get("/dashboard",validateToken,getDashboardData)
AdminRouter.post("/update-allowed-models/:userId",validateToken,updateUser)
// Assuming you have an addUser function
// Export the router
export default AdminRouter;

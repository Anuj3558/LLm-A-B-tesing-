import { Router } from "express"
import { validateToken } from "../../middleware/ValidateToken.js"
import { getAllowedModels, getUserDashboard } from "../../controller/User/userController.js"

const UserRouter = Router()


UserRouter.get('/dashboards/:userId', validateToken,getUserDashboard)
UserRouter.get('/allowed-models',validateToken, getAllowedModels)
export default UserRouter
import { Router } from "express"
import { validateToken } from "../../middleware/ValidateToken.js"
import { getAllowedModels, getUserDashboard, testPromptAcrossModels } from "../../controller/User/userController.js"

const UserRouter = Router()


UserRouter.get('/dashboards/:userId', validateToken,getUserDashboard)
UserRouter.get('/allowed-models',validateToken, getAllowedModels)
UserRouter.post("/prompt-test",validateToken,testPromptAcrossModels)
export default UserRouter
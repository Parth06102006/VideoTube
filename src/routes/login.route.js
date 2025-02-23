import { Router } from "express";
import { login,refreshAccessToken } from "../controllers/user.controller.js";

const router = Router();

router.route('/login').post(login)
router.route('/refresh-token').post(refreshAccessToken);

export default router
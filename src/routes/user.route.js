import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {verifyJWT} from '../middlewares/auth.middleware.js'
import { register,login,refreshAccessToken,logOut,changePassword,updateAccountDetails,updateUserAvatar,updateCoverImage,getCurrentAccountDetails,getUserChannelProfile } from "../controllers/user.controller.js";

const router = Router();

//unsecured routes
router.route('/register').post(upload.fields(
        [
            {name:'avatar',maxCount:1},
            {name:'coverImage',maxCount:5},
        ]
    ),
    register
)
router.route('/login').post(login)
router.route('/refresh-token').post(refreshAccessToken);

// Secured routes
router.route('/logout').post(verifyJWT,logOut);
router.route('/change-password').post(verifyJWT,changePassword);
router.route('/update-account-details').patch(verifyJWT,updateAccountDetails);
router.route('/update-avatar').post(verifyJWT,upload.single('avatar'), updateUserAvatar);
router.route('/update-cover-image').post(verifyJWT,upload.single('coverImage'), updateCoverImage);
router.route('/current-account-details').get(verifyJWT,getCurrentAccountDetails);
router.route('/user-channel-profile/:username').get(verifyJWT,getUserChannelProfile);



export default router
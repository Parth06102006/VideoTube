import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiError } from "../utilis/ApiError.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwentoken'

export const verifyJWT = asyncHandler(async(req,resizeBy,next)=>
{
    const accessToken = req.cookies.accessToken || req.body.accessToken || req.header('Authorization').replace('Bearer ','');
    console.log(accessToken);

    if(!accessToken)
    {
        throw new ApiError(400,'Access Token not found');
    }

    try {
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        console.log(decodedToken)
        const userId = decodedToken?._id;
        if(!userId)
        {
            throw new ApiError(401,'Invalid Access token');
        }

        const user = await User.findById(userId);
        if(!user)
        {
            throw new ApiError(403,'User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(500,'Error accessing the access token')
    }
})
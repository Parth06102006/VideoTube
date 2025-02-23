import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiResponse } from "../utilis/ApiResponse.js";

const healthcheck = asyncHandler(async (req,res,next)=>
{
    res.json(new ApiResponse(200,'Healthcheck:Success'));
})

export {healthcheck}
import { ApiError } from "../utilis/ApiError.js";
import mongoose from "mongoose";
import dotenv from 'dotenv'

const errorHandler = (err,req,res,next)=>
{
    let error = err;
    console.log(error);
    
    if(!(error instanceof ApiError))
    {
        const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
        const message = error.message || 'Something went wrong';
        error = new ApiError(statusCode,message, error?.errors || [],error.stack)
    }
    const response =  
    {
        ...error,
        message:error.message,
        ...(process.env.NODE_ENV === 'development' ? {stack:error.stack}:{})
    }
    return res.status(error.statusCode).json(response);
}

export {errorHandler}
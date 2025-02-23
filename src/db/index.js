import mongoose from "mongoose";
import { asyncHandler } from "../utilis/asyncHandler.js";
import {DB_NAME} from '../constants.js'

const dbConnection = async ()=>
{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('Database connected successfully at',DB_NAME)
    } catch (error) {
        console.log('Database not connected')
        process.exit(1)
    }
}

export default dbConnection
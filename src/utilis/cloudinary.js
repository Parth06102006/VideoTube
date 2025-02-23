import {v2 as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'
import fs from 'fs'

dotenv.config(
    {
        path:'./.env'
    }
)

// const cloudinaryConnect = async function()
// {
cloudinary.config
(
    {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    }
)
// }

export const uploadOnCloudinary = async(localFilePath)=>
{
    try {
            const response = await cloudinary.uploader.upload(localFilePath,{resource_type:'auto'})
            console.log(`File is uploaded on Clodinary at ${response.url}`)
            fs.unlinkSync(localFilePath);
            return response
    } catch (error) {
            fs.unlinkSync(localFilePath);
            res.status(500).json({
                success:false,
                message:'Cannot be uploaded'
            })
            return null
    }
}

export const deleteFromCloudinary = async(public_id)=>
{
    try {
        await cloudinary.uploader.destroy(public_id);
        console.log(`File of publicId: ${public_id} is deletd successfully`)
    } catch (error) {
        console.log('Error deleting the file')
    }
}


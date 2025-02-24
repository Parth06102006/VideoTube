import {Video} from '../models/video.model.js'
import { ApiError } from '../utilis/ApiError.js'
import { ApiResponse } from '../utilis/ApiResponse.js'
import { asyncHandler } from '../utilis/asyncHandler.js'
import { deleteFromCloudinary, uploadOnCloudinary } from '../utilis/cloudinary.js'
import { User } from '../models/user.model.js'
import mongoose from 'mongoose'

const getAllVideo = asyncHandler(async(req,res,next)=>{
    const {page = 1,limit= 10,query, sortBy, sortType,userId} = req.query;
    console.log(page,limit,query,sortBy,sortType,userId);
    if(!query)
    {
        throw new ApiError(400,'Query not found');
    }
    //here there is issue in setting up the match for the sortBy,SortTyoe,userId,page
    const videoList = await Video.aggregate
    (
        [
            {
                $match:
                {
                    title:query,
                }
            },
            {
                $limit:limit
            }
        ]
    )


    if(!videoList.length())
    {
        throw new ApiError(400,'Video not found');
    }
    return res.status(200).json(new ApiResponse(200,videoList,'Vides LIst extracted successfully'))

})

const publishAVideo = asyncHandler(async (req, res,next) => {
    const { title, description} = req.body
    console.log(title,description);
    if(!title||!description)
    {
        throw new ApiError(400,'Fields are incomplete')
    }
    // TODO: get video, upload to cloudinary, create video
            const videoPath = req.files?.video?.[0].path;
            const thumbnailPath = req.files?.video?.[0].path;
            console.log(thumbnailPath,videoPath);
        
            if(!videoPath)
            {
                throw new ApiError(403,'Video Path is not present')
            }
        
            if(!thumbnailPath)
            {
                throw new ApiError(403,'Thumbnail Path is not present')
            }
        
            let videoFile;
            try{
                videoFile = await uploadOnCloudinary(videoPath);
                console.log(videoFile);
                console.log('Video Uplaoded SUCCESSFULLY');
                
            }
            catch{
                throw new ApiError(400,'Error Uplaoding the Video')
            }
        
            let thumbnailFile;
            try{
                thumbnailFile = await uploadOnCloudinary(thumbnailPath);
                console.log(thumbnailFile);
                console.log('Thumbnail Uplaoded SUCCESSFULLY');
                
            }
            catch{
                throw new ApiError(400,'Error Uplaoding the Thumbnail')
            }
        try {
            const user = await User.findById(req.user?._id);
            if(!user)
            {
                throw new ApiError(404,'User not found')
            }

            const video = await Video.create({title,description,videoFile:videoFile.url,thumbnail:thumbnailFile.url,duration:videoFile.duration,isPublished:true,owner:user._id});

            console.log(video);

            const uploadedVideo = await video.findById(video?._id);
            if(!uploadedVideo)
            {
                throw new ApiError(403,'Video upload unsuccessful')
            }

    } catch (error) {
        console.log('Error in uploading the video');
        if(videoFile)
        {
            await deleteFromCloudinary(videoFile.public_id)
            console.log('Video deleted from cloudinary')
        }
        if(thumbnailFile)
        {
            await deleteFromCloudinary(thumbnailFile.public_id)
            console.log('Thumbnail deleted from cloudinary')
        }
        throw new ApiError(500,'Something went wrong while uploading the video')
    }
})

const getVideoById = asyncHandler(async (req, res) => {
    const videoId = req.params.videoId;

    const videoExist = await Video.findById(videoId);

    if(!videoExist||!videoExist.isPublished)
    {
        throw new ApiError('Video does not exist')
    }

    const video = await Video.aggregate
    (
        [
            {
                $match:{_id:videoId}
            },
            {
                $lookup:{
                    from:'users',
                    localField:'owner',
                    foreignField:'_id',
                    as:'videoOwner',
                    pipeline:[
                        {
                            $project:{
                                fullname:1,
                                username:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
                $addFields:{
                    videoOwner:{$first:'$videoOwner'}
                }
            }
        ]
    )

    return res.status(200).json(new ApiResponse(200,{video:videoExist.videoFile,thumbnail:videoExist.thumbnail,details:video[0]},'Video details fetched successfully'))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoExists = await Video.findById(videoId);
    if(!videoExists)
    {
        throw new ApiError(404,'Video not found');
    }

    const {title,description} = req.body;
    if(!title||!description)
    {
        throw new ApiError(403,'Fields are empty')
    }

    const thumbnailPath = req.files?.path;
    console.log(thumbnailPath);

    try {
        await deleteFromCloudinary(videoExists.public_id);
        console.log('Old thumbnail has been deleted successfully')
    } catch (error) {
        throw new ApiError(400,'Error deleting the old thumbnail');
    }

    let newThumbnail;
    try {
        newThumbnail = await uploadOnCloudinary(thumbnailPath);
        console.log('New thumbnail has been added successfully')
    } catch (error) {
        throw new ApiError(400,'Error updating thumbnail')   
    }

    videoExists.thumbnail = newThumbnail?.url;
    videoExists.title = title;
    videoExists.description = description;
    await videoExists.save();

    console.log(videoExists);

    return res.status(200).json(new ApiResponse(200,{videoDetails:videoExists},'Details has been updated successfully'));
})

const deleteVideo = asyncHandler(async(req,res,next)=>{
    const { videoId } = req.params

    const videoExists = await Video.findByIdAndDelete(videoId);
    console.log(videoExists);
    if(!videoExists)
    {
        throw new ApiError(400,'Video not found');
    }

    return res.status(200).json(new ApiResponse(200,{},'Video has been deleted successfully'));
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoExist = await Video.findById(videoId);
    if(!videoExist)
    {
        throw new ApiError(400,'Video not found');
    }

    if(!videoExist.isPublished)
    {
        videoExist.isPublished = true;
    }
    else
    {
        videoExist.isPublished = false;
    }

    await videoExist.save();

    return res.status(200).json(new ApiResponse(200,{publishStatus:videoExist.isPublished},'Neccessary changes has been made successfully'));
})
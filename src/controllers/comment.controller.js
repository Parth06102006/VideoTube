import {Comment} from '../models/comment.models.js'
import { asyncHandler } from '../utilis/asyncHandler.js'
import { ApiError } from '../utilis/ApiError.js'
import { ApiResponse } from '../utilis/ApiResponse.js'
import { User } from '../models/user.model.js'
import { Video } from '../models/video.model.js'

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const videoId = req.params.videoId;
    const content = req.body;
    const userId = req.user?._id;

    const video = await Video.findById(videoId);
    if(!video)
    {
        throw new ApiError(400,'Video does not exist');
    }

    if(!content?.trim())
    {
        throw new ApiError('Comment is Empty');
    }

    const commentAdded = await Comment.create({content,video:video._id,owner:userId});

    console.log(commentAdded);

    if(!commentAdded)
    {
        throw new ApiError(403,'Error in commenting the video');
    }

    return res.status(200).json(new ApiResponse(200,commentAdded,'Commented on the video successfully'))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const videoId = req.params.videoId;
    const userId = req.user?._id;
    const newCommnet = req.body;
    const comment = await Comment.findOne({video:videoId,owner:userId});

    if(!comment)
    {
        throw new ApiError(403,'Comment not found')
    }

    comment.content = newCommnet;
    await comment.save();

    return res.status(200).json(new ApiResponse(200,'Comment updated successfully'));
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const videoId = req.params.videoId;
    const userId = req.user?._id;
    const comment = await Comment.findOneAndDelete({video:videoId,owner:userId});
    if(!comment)
    {
        throw new ApiError(400,'Comment not found')
    }
    console.log(comment);
    throw new ApiResponse(200,{},'Comment deleted Successfully');
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
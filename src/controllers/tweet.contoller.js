import {Tweet} from '../models/tweet,.model.js'
import { asyncHandler } from '../utilis/asyncHandler.js'
import { ApiError } from '../utilis/ApiError.js'
import { ApiResponse } from '../utilis/ApiResponse.js'
import {User} from '../models/user.model.js'



const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const tweetContent = req.body;
    console.log(tweetContent);

    if(!tweetContent)
    {
        throw new ApiError(400,'Content is missing')
    }

    const tweet = await Tweet.create({content:tweetContent,owner:req.user?._id});

    return res.status(200).json(new ApiResponse(200,tweet,'Tweet created successfully'))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if(!user)
    {
        throw new ApiError(400,'User not found');
    }

    const tweetsList = await Tweet.aggregate
    (
        [
            {
                $match:
                {
                    owner: userId,
                }
            }
        ]
    )

    if(!tweetsList.length())
    {
        throw new ApiError(401,'No tweets found')
    }

    return res.status(200).json(new ApiResponse(200,tweetsList[0],'Tweets retrieved successfully'));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const userId = req.user?._id;
    const {tweetId,newTweet} = req.body;
    const tweet = await Tweet.findOneAndUpdate({owner:userId,_id:tweetId},{$set:{content:newTweet}},{new:true});

    return res.status(200).json(200,tweet,'Tweet Updated Successfully');
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const userId = req.user?._id;
    const {tweetId} = req.body;
    const tweet = await Tweet.findOneAndDelete({owner:userId,_id:tweetId});

    return res.status(200).json(200,tweet,'Tweet Deleted Successfully');
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
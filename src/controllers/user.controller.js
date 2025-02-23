import { asyncHandler } from "../utilis/asyncHandler.js";
import { ApiResponse } from "../utilis/ApiResponse.js";
import { ApiError } from "../utilis/ApiError.js";
import {User} from '../models/user.model.js'
import { uploadOnCloudinary ,deleteFromCloudinary} from "../utilis/cloudinary.js";
import jwt from 'jsonwebtoken'

const generateAccessandRefreshToken = async(userId)=>
{
    const user = await User.findById(userId);
    console.log(user);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save();
    return {accessToken,refreshToken};
}
const register = asyncHandler(async (req,res,next)=>
{
    const {fullname,email,password,username} = req.body;
    if([fullname,email,password,username]?.some(t=> t?.trim()===''))
    {
        throw new ApiError(400,'Field was missing');
    }

    const existedUser = User.findOne({$or:[email,username]});
    if(!existedUser)
    {
        throw new ApiError(401,'User is already registered')
    }

    const avatarLocalPath =req.files?.avatar?.[0]?.path
    const coverLocalPath =req.files?.coverImage?.[0]?.path
    console.log(coverLocalPath);

    let avatarInfo;
    if(avatarLocalPath)
    {
        try {
            avatarInfo = await uploadOnCloudinary(avatarLocalPath);
            console.log('Uploaded Avatar',avatarInfo);
        } catch (error) {
            console.log('Error uploading the file');
            throw new ApiError(500,'Error Uploading the file')
        }
    }
    else
    {
        throw new ApiError(400,'Avatar file not present')
    }

    let coverImageInfo;
    {
        try {
            coverImageInfo = await uploadOnCloudinary(coverLocalPath);
            console.log('Uploaded Avatar',coverImageInfo);
        } catch (error) {
            console.log('Error uploading the file');
            throw new ApiError(500,'Error Uploading the file')
        }
    }

try {
    const user = await User.create({fullname,email,password,username:username.toLowerCase(),avatar:avatarInfo.url,coverImage:coverImageInfo?.url || ''});
    const createdUser = await User.findById(user._id).select('-password -refreshToken');
    console.log(createdUser);
    if(!createdUser)
    {
        throw new ApiError(500);
    }
    return res.json(new ApiResponse(201,createdUser,'User registered Successfully'))
} catch (error) {
    console.log(`Error registering the user`);
    if(avatarInfo)
    {
        await deleteFromCloudinary(avatarInfo.public_id)
    }
    if(coverImageInfo)
    {
        await deleteFromCloudinary(coverImageInfo.public_id)
    }
    throw new ApiError(500,'Something went wrong while registering user and files from cloudinary is deleted')
}

})

const login = asyncHandler(async (req,res,next)=>
{
    const {email,username,password} = req.body;
    if(!email||!username)
    {
        throw new ApiError(400,'Username or EmailID not found');
    }

    const user = await User.findOne({$or:[{username},{email}]});
    console.log(user);

    if(!user)
    {
        throw new ApiError(403,'User is not registered')
    }
    // console.log(typeof password);
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
    {
        throw new ApiError(403,'Password Incorrect');
    }

    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id);
    console.log(loggedInUser);
    if(!loggedInUser)
    {
        throw new ApiError(404,'User cannat be logged In');
    }

    const options = {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production'
    }

    res.status(200).cookie('accessToken',accessToken,options).cookie('refreshToken',refreshToken,options).json(new ApiResponse(200,{user:loggedInUser,accessToken,refreshToken},'User Logged In Successfully'));
})

const refreshAccessToken = asyncHandler(async (req,res,next)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken || req.header('Authentication').replace('Bearer ','');
    console.log(incomingRefreshToken);
    if(!incomingRefreshToken)
    {
        throw new ApiError(400,'Refresh Token not found');
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        console.log(decodedToken);
    } catch (error) {
        throw new ApiError(401,'Invalid Refresh Token')
    }

    const user = await User.findById(decodedToken._id);

    if(!user)
    {
        throw new ApiError(403,'User cannot be found');
    }

    console.log(user);
    const {accessToken,refreshToken} = await generateAccessandRefreshToken(user?._id);

    const options = {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production'
    }

    return res.status(200).cookie('accessToken',accessToken,options).cookie('refreshToken',refreshToken,options).json(new ApiResponse(200,{user,accessToken,refreshToken},'Access token is refreshed successfully'));
})

const logOut = asyncHandler(async(req,res,next)=>{
    const user = await User.findByIdAndUpdate(req.user?._id,{$unset:[{refreshToken}]},{new:true}).select('-password');

    if(!user)
    {
        throw new ApiError(400,'User not found');
    }
    console.log(user);
    clearCookie('accessToken');
    clearCookie('refreshToken');
    res.status(200).json(200,{},'user logged out successfully')
})

const changePassword = asyncHandler(async(req,res,nenxt)=>{
    const {oldPasssword,newPassword} = req.body;

    if([oldPasssword,newPassword].some(t => t?.trim() === ''))
    {
        throw new ApiError(403,'Fields are empty');
    }

    const user = await User.findById(req.user?._id);
    console.log(user);

    if(!user)
    {
        throw new ApiError(404,'User not found');
    }
    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid)
    {
        throw new ApiError(403,'Wrong Password')
    }

    user.password = newPassword;
    user.save({validateBeforeSave:false});

    return res.status(200).json(new ApiResponse(200,{},'Password Changed Successfully'))
})

const updateAccountDetails = asyncHandler(async(req,res,next)=>{
    const {username} = req.body;

    if(!username?.trim())
    {
        throw new ApiError(400,'Enter the field')
    }

    const user = await User.findByIdAndUpdate(req.user?._id,{$set:[{username}]},{new:true}).select('-password refreshToken');

    if(!user)
    {
        throw new ApiError(400,'User not found')
    }

    return res.status(200).json(new ApiResponse(200,user,'Account Details has been updated successfully'));

})

const updateUserAvatar = asyncHandler(async(req,res,next)=>
    {
        const user = await User.findById(req.user?._id);
        console.log(user);
        
        try {
            
        } catch (error) {
            
        }
    })
export {register,login,refreshAccessToken,logOut,changePassword,updateAccountDetails}
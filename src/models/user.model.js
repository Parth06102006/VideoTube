import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

const userSchema = new Schema(
    {
        username:
        {
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullname:{
            type:String,
            required:true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String, //cloudinary url
            required:true,
        },
        coverImage:{
            type:String //cloudinary url
        },
        watchHistory:
        [
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password:
        {
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:
        {
            type:String,
        },
    },
    {timestamps:true}
)

userSchema.pre('save',async function(next)
{
    if(! this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.isPasswordCorrect = async function(p)
{
    const password = String(p)
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function()
{
    const accessToken = jwt.sign({_id:this._id,username:this.username,email:this.email,fullname:this.fullname},process.env.ACCESS_TOKEN_SECRET,{expiresIn: process.env.ACCESS_TOKEN_EXPIRY})
    return accessToken;
}

userSchema.methods.generateRefreshToken = function()
{
    const refreshToken = jwt.sign({_id:this._id},process.env.REFRESH_TOKEN_SECRET,{expiresIn: process.env.REFRESH_TOKEN_EXPIRY})
    return refreshToken;
}

userSchema.plugin(mongooseAggregatePaginate)
export const User = mongoose.model('User',userSchema)
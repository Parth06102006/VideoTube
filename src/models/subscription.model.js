import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema
(
    {
      subscriber:
        {
            type:Schema.Types.ObjectId,
            ref:'User',
        },
        channel:
        {
            type:Schema.Types.ObjectId,//to who I am Subscribing 
            ref:'User',
        }
    },
    {timestamps:true}
)

export const Subscriber = mongoose.model('Subscriber',subscriptionSchema);
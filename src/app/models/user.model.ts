import { model, Schema } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true
    },
    password:{
        type: String,
        require: true
    }
})

export const User = model("User", userSchema)
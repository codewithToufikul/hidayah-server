import mongoose, { Schema } from "mongoose";

const inputSchema = new Schema({
  userid: {
    type: Schema.Types.ObjectId, 
    ref: "User",
    required: false,
  },
  inputText: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, 
});

const Input = mongoose.model("Input", inputSchema);

export default Input;

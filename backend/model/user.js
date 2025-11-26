import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  
  profilePicture: {
    type: String,
   default: "/images/pp.png",
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  token:{
    type: String,
    default: null
  },
  socketId:{
    type: String,
    default: null
  }
}, { timestamps: true }); // ✅ correct spelling here

module.exports = mongoose.model("User", UserSchema);

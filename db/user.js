const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true }
  },
  { strict: false }
);

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;

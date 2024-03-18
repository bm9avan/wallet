const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, require: true, unique: true },
  password: String,
});

userSchema.pre("save", function (next) {
  if (this.isModified("password"))
    this.password = bcrypt.hashSync(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return bcrypt.compareSync(password, this.password);
};

exports.userModel = mongoose.model("User", userSchema);

const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    balance: { type: Number, default: 0 },
  },
);

exports.accountModel = mongoose.model("Account", accountSchema);

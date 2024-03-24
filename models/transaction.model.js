const mongoose = require("mongoose");
const { accountModel } = require("./account.model");

const transactionSchema = new mongoose.Schema(
  {
    fromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    toId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: { type: Number, required: true },
    message: String,
  },
  { timestamps: true }
);

// Define a pre hook on the Transaction model to update account balances
transactionSchema.pre("save", async function (next) {
  const session = await mongoose.startSession();
  try {
    // Retrieve the accounts involved in the transaction
    if (this.fromId.equals(this.toId)) {
      throw new Error("Both accounts are same");
    }
    session.startTransaction();
    const fromAccount = await accountModel
      .findOne({ userId: this.fromId })
      .session(session);
    const toAccount = await accountModel
      .findOne({ userId: this.toId })
      .session(session);
    // Check if both accounts exist
    if (!fromAccount || !toAccount) {
      throw new Error("One or both accounts not found");
    }
    if (fromAccount.userId.equals(process.env.ADMIN_ACC_ID)) {
      toAccount.balance += this.amount;
      await toAccount.save({ session });
    } else {
      // Update the balances
      if (fromAccount.balance < this.amount) {
        throw new Error("Insufficient balance");
      }
      fromAccount.balance -= this.amount;
      toAccount.balance += this.amount;
      // Save the updated balances
      await fromAccount.save({ session });
      await toAccount.save({ session });
    }

    await session.commitTransaction();
    // Proceed to save the transaction
    next();
  } catch (error) {
    // If an error occurs, call the next middleware function with the error
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});

exports.transactionModel = mongoose.model("Transaction", transactionSchema);

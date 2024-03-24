const { accountModel } = require("../models/account.model");
const { transactionModel } = require("../models/transaction.model");

exports.balance = async (req, res) => {
  try {
    const result = await accountModel.findOne({ userId: req.user._id });
    return res.json({ balance: result.balance });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

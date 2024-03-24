const { transactionModel } = require("../models/transaction.model");

exports.send = async (req, res) => {
  const toId = req.params.to;
  const amount = req.query.amt;
  try {
    await transactionModel.create({ fromId: req.user._id, toId, amount }); //inside model pre save middleware manages rest everything
    return res.json({ success: "Transaction successful" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

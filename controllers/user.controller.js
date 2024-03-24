const jwt = require("jsonwebtoken");
const user = require("../models/user.model");
const { z } = require("zod");
const { accountModel } = require("../models/account.model");
const { transactionModel } = require("../models/transaction.model");

userZodSignup = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

userZodLogin = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

userZodEmail = z.string().email({ message: "Invalid email address" });

userZodString = z.string({ message: "Invalid string" });

exports.signup = async (req, res) => {
  const zodUser = userZodSignup.safeParse(req.body);
  const ref = req.query.ref;
  if (!zodUser.success) {
    res
      .status(408)
      .json({ error: zodUser.error.issues.map((e) => e.message).join(", ") });
  } else {
    try {
      let result;
      const refUser = ref ? await user.userModel.findById(ref) : null;
      if (refUser) {
        result = await user.userModel.create({ ...zodUser.data, ref });
      } else {
        result = await user.userModel.create(zodUser.data);
      }
      await accountModel.create({
        userId: result._id,
      });
      await transactionModel.create({
        fromId: process.env.ADMIN_ACC_ID,
        toId: result._id,
        amount: 200,
        message: "Signup bonus",
      });
      if (refUser) {
        await transactionModel.create({
          fromId: process.env.ADMIN_ACC_ID,
          toId: result._id,
          amount: 200,
          message: `referral bonus (You Singed up from ${refUser.name}'s referral)`,
        });
        ref !== process.env.ADMIN_ACC_ID &&
          (await transactionModel.create({
            fromId: process.env.ADMIN_ACC_ID,
            toId: ref,
            amount: 200,
            message: `referral bonus (${result.name} Singed up from your referral)`,
          }));
      }
      const token = jwt.sign(
        { _id: result._id, name: result.name, email: result.email },
        process.env.JWT_SECRET
      );
      res.json({ token });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

exports.login = async (req, res) => {
  const zodUser = userZodLogin.safeParse(req.body);
  if (!zodUser.success) {
    res
      .status(408)
      .json({ error: zodUser.error.issues.map((e) => e.message).join(", ") });
  } else {
    try {
      const result = await user.userModel.findOne({
        email: zodUser.data.email,
      });
      if (!result) return res.status(404).json({ error: "User Not Found" });
      const isValid = await result.isPasswordCorrect(zodUser.data.password);
      if (isValid) {
        const token = jwt.sign(
          { _id: result._id, name: result.name, email: result.email },
          process.env.JWT_SECRET
        );
        res.json({ token });
      } else {
        return res.status(408).json({ error: "Incorrect Password" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

exports.update = async (req, res) => {
  const zodUser = userZodString.safeParse(req.body.name);
  if (!zodUser.success) {
    res
      .status(408)
      .json({ error: zodUser.error.issues.map((e) => e.message).join(", ") });
  } else {
    try {
      const userResult = await user.userModel.findOne({
        email: req.user.email,
      });
      userResult.name = zodUser.data;
      await userResult.save({ validateBeforeSave: false });
      res.json({ success: "Name updated successfully" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

exports.updatePassword = async (req, res) => {
  const zodNewPassword = userZodString.safeParse(req.body.newPassword);
  const zodCurPassword = userZodString.safeParse(req.body.currentPassword);
  if (!zodNewPassword.success || !zodCurPassword.success) {
    res.status(408).json({
      error:
        zodNewPassword.error?.issues.map((e) => e.message).join(", ") +
        " " +
        zodCurPassword.error?.issues.map((e) => e.message).join(", "),
    });
  } else {
    try {
      const userResult = await user.userModel.findOne({
        email: req.user.email,
      });
      const passwordcorrect = await userResult.isPasswordCorrect(
        zodCurPassword.data
      );
      if (passwordcorrect) {
        userResult.password = zodNewPassword.data;
        await userResult.save({ validateBeforeSave: false });
        res.json({ success: "Password updated successfully" });
      } else {
        return res.status(402).json({ error: "Invalid current Password" });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

exports.users = async (req, res) => {
  const zodName = userZodString.safeParse(req.query.filter);
  if (!zodName.success) {
    res
      .status(408)
      .json({ error: zodName.error.issues.map((e) => e.message).join(", ") });
  } else {
    try {
      const userResult = await user.userModel
        .find({
          name: {
            $regex: zodName.data,
          },
        })
        .select("-password");
      return res.json(userResult);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
};

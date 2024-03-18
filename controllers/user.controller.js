const jwt = require("jsonwebtoken");
const user = require("../models/user.model");
const { z } = require("zod");

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
  if (!zodUser.success) {
    res
      .status(408)
      .json({ error: zodUser.error.issues.map((e) => e.message).join(", ") });
  } else {
    try {
      const result = await user.userModel.create(zodUser.data);
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
        email: JSON.parse(req.user).email,
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
  const zodUser = userZodLogin.safeParse(req.body);
  const zodpassword = userZodString.safeParse(req.body.oldpassword);
  if (!zodUser.success || !zodpassword.success) {
    res.status(408).json({
      error:
        zodUser.error?.issues.map((e) => e.message).join(", ") +
        " " +
        zodpassword.error?.issues.map((e) => e.message).join(", "),
    });
  } else {
    try {
      const userResult = await user.userModel.findOne({
        email: zodUser.data.email,
      });
      const passwordcorrect = await userResult.isPasswordCorrect(
        zodpassword.data
      );
      if (passwordcorrect) {
        userResult.password = zodUser.data.password;
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

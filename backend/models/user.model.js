const mongoose = require("mongoose");
const Joi = require("@hapi/joi");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const id = {
  type: String,
  length: 24,
  required: true,
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
    },
    join_date: { type: Number, required: true },
    bio: String,
    followers: [String],
    follower_count: { type: Number, default: 0 },
    following: [String],
    tweets: [{ _id: 0, id: id, date: Number, retweeter: id }],
    isAdmin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
userSchema.index({ follower_count: -1 });
userSchema.index({ "tweets.date": -1 });
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, username: this.username, isAdmin: this.isAdmin },
    process.env.myprivatekey
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  let count = 0;
  if (user.followers) for (x of user.followers) count++;
  const schema = Joi.object({
    id: Joi.string(),
    username: Joi.string()
      .pattern(/^((?!\s).)*$/)
      .min(3)
      .max(50)
      .required(),
    bio: Joi.string().allow("").max(280),
    password: Joi.string().min(4).max(255).required(),
    follower_count: Joi.number().equal(count),
    repeat_password: Joi.any().valid(Joi.ref("password")).required(),
    following: Joi.array(),
    followers: Joi.array(),
    tweets: Joi.array(),
    join_date: Joi.number().required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;

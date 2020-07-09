const jwt = require("jsonwebtoken");
require("dotenv").config();
module.exports = function (req, res, next) {
  //get token from header if present
  const token = req.cookies["x-access-token"] || req.cookies["authorization"];
  //if no token, return response (without going to next middleware)
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    //if can verify token, set req.user and pass to next middleware
    const decoded = jwt.verify(token, process.env.myprivatekey);
    req.user = decoded;
  } catch (err) {
    res.status(400).send("invalid token");
  }
  next(); //pass to the next router/middleware
};

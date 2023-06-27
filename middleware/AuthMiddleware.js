const jwt = require("jsonwebtoken");

const Protect  =async (req, res, next) => {
  try {
    const token = await req.headers.authorization.split(' ')[1]
    if (!token) return res.status(403).send("Access denied.");

    const decoded = await jwt.verify(token, 'HelloWorld');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send("invalid token");
  }
};

module.exports = {Protect}
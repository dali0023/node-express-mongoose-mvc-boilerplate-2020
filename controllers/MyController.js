const User = require("../models/MyModel");
const home = (req, res, next) => {
  res.render("index");
};

module.exports = { home };

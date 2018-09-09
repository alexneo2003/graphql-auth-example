const mongoose = require("mongoose");

const User = require("./user");

const startDB = ({ user, pass, url, db }) => {
  mongoose
    .connect(
      `mongodb://${user}:${pass}@${url}/${db}`,
      { useNewUrlParser: true }
    )
    .then(() => {
      console.log("mongo connected...");
      mongoose.set("useFindAndModify", false);
    });
};

const models = {
  User
};

module.exports = { startDB, models };

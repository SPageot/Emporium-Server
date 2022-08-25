const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema(
  {
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const user = mongoose.model("User", userSchema);
module.exports = user;

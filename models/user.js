const mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");
if (passportLocalMongoose && passportLocalMongoose.default) {
  passportLocalMongoose = passportLocalMongoose.default;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
});

// Ensure the plugin is a function (handles ESM default export interop)
if (typeof passportLocalMongoose !== "function") {
  throw new Error("passport-local-mongoose plugin not found or invalid");
}
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);

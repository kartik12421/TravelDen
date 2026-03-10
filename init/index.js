const mongoose = require("mongoose");
const initdata = require("./data.js");
const listing = require("../models/listing.js");

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wonderPlace");
}
main()
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

async function initData() {
  await listing.deleteMany({});
  initdata.data = initdata.data.map((obj) => ({...obj, owner: "6980a4ce6a8f9f4470969757"}));
  await listing.insertMany(initdata.data);
  console.log("data init successfully");
}

initData();

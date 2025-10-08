const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("MongoDB kết nối thành công");
  } catch (err) {
    console.error("Lỗi kết nối với MongoDB", err);
    process.exit(1);
  }
};

module.exports = connectDB;

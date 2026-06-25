const mongoose = require("mongoose");
const colors = require("colors");

const MONGO_URI = process.env.MONGO_URI;

const connect_db = async() => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(colors.green("Database Connected Successfully!!!"));
        if (conn.connection.readyState === 1) {
          return true;
        }
        return false;
    } catch(error) {
        console.log(colors.red("Database Connection Failed!!!"));
        //console.log(colors.red("Error : ",error))
        return false;
    }
};

module.exports = connect_db;
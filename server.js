const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");


dotenv.config();
const PORT = process.env.PORT || 5001; 

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("GYM-OS SERVER!!!");
});

const connect_db = require("./config/connectDB");

const start_server = async () => {
    const hogaya_connection = await connect_db();
    if (hogaya_connection) {
        app.listen(PORT, () => {
            console.log(colors.green(`Server Running On Port ${PORT}`));
        });
    }
    else{
         console.log(colors.blue(`Halting Operations!!!`)); 
    }
};

start_server();
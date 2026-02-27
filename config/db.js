const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "chuks_kitchen.db");

const db = new sqlite3.Database(dbPath, (err)=>{
    if(err){
        console.log("Error occurred in connecting database", err.message);
    }else{
        console.log("DB CONNECTED");
    }
});

module.exports = db;
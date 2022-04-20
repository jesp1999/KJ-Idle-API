const bcrypt = require("bcrypt")
const { MongoClient, ServerApiVersion, MongoCursorInUseError } = require('mongodb');
var express = require('express');
var router = express.Router();

require("dotenv").config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = { //TODO make this a mongo connection pool
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
};
//remember to include .env in .gitignore file

const uri = 'mongodb+srv://' + encodeURIComponent(db.user) + ':' + encodeURIComponent(db.password) + '@' + db.host;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

//CREATE USER
router.post('/createUser', async (req,res,next) => {
    const username = req.body.username;
    const hashedPassword = await bcrypt.hash(req.body.password,10);

    client.connect(async err => {
        if (err) throw (err);
        const collection = client.db(db.database).collection('userDB'); //todo make tablename an env variable?
        // perform actions on the collection object
        console.log(username)
        collection.find({Username: username}).hasNext().then(userAlreadyExists => {
            console.log(userAlreadyExists);
            if (userAlreadyExists > 0) {
                //TODO throw an error, user already exists!
                console.log('------> User already exists');
                res.sendStatus(409) ;
            } else {
                collection.insertOne({
                    Username: username,
                    HashedPassword: hashedPassword
                });
                console.log ('--------> Created new User'); //TODO log user IDs
                res.sendStatus(201);
            }
        });
    }); //end of client.connect()
}) //end of app.post()

module.exports = router;
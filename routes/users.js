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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    client.connect(async err => {
        if (err) throw (err);
        const collection = client.db(db.database).collection('userDB'); //todo make tablename an env variable?

        // if entry matching username exists in userDB, don't add new one
        collection.find({Username: username}).hasNext().then(userAlreadyExists => {
            if (userAlreadyExists) {
                //TODO throw an error, user already exists!
                console.log('------> User already exists');
                res.sendStatus(409) ;
            } else {
                collection.insertOne({
                    Username: username,
                    HashedPassword: hashedPassword,
                    Salt: salt
                });
                console.log ('--------> Created new User'); //TODO log user IDs
                res.sendStatus(201);
            }
        });
    }); //end of client.connect()
}) //end of app.post()

router.post('/login', async (req,res,next) => {
  const username = req.body.username;

  client.connect(async err => {
    if (err) throw (err);
    const collection = client.db(db.database).collection('userDB'); //todo make tablename an env variable?

    //TODO fix or suppress this "unnecessary await" warning (it is necessary!)
    const salt = (await (collection.findOne({ Username: username }, "Salt"))).Salt;
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    collection.find({Username: username, HashedPassword: hashedPassword}).hasNext().then(loginSuccess => {
      if (loginSuccess) {
        console.log("--------> Login successful");
        res.sendStatus(200);
      } else {
        console.log("--------> Login failed");
        res.sendStatus(401);
      }
    });
  });
});

module.exports = router;
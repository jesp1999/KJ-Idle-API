const bcrypt = require("bcrypt")

require("dotenv").config()
const DB_HOST = process.env.DB_HOST
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_DATABASE = process.env.DB_DATABASE
const DB_PORT = process.env.DB_PORT
const db = mongo.createPool({ //might not even be valid syntax TODO
   connectionLimit: 100,
   host: DB_HOST,
   user: DB_USER,
   password: DB_PASSWORD,
   database: DB_DATABASE,
   port: DB_PORT
})
//remember to include .env in .gitignore file

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://" + db.user + ":" + db.password + "@" + db.host;

app.use(express.json())
//middleware to read req.body.<params>

app.get("/hello", async (req,res) => {
    res.sendStatus(200);
    res.send("Hello world!");
})
//CREATE USER
app.post("/createUser", async (req,res) => {
    const user = req.body.name;
    const hashedPassword = await bcrypt.hash(req.body.password,10);

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect(err => {
        if (err) throw (err);
        const collection = client.db(db.database).collection("userDB"); //todo make tablename an env variable?
        // perform actions on the collection object
        var cursor = collection.find({Username: user});
        if (cursor.length == 0) {
            collection.insertOne({
                Username: user,
                HashedPassword: hashedPassword
            });
        console.log ("--------> Created new User"); //TODO log user IDs
        res.sendStatus(201);
        } else {
            //TODO throw an error, user already exists!
            console.log("------> User already exists");
            res.sendStatus(409) ;
        }
        client.close();
    }); //end of client.connect()
}) //end of app.post()

app.listen(3000, () => {
    console.log("Listening at http://localhost:3000");
})

//TODO make the backend a completely different project (probably best solution)
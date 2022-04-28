const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();

// middleware

app.use(cors());
app.use(express.json());

// connect with mongo

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lme8t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("user connected");

    const productCollection = client.db("goodFoods").collection("products");

    // upload product

    app.post("/uploadproduct", async (req, res) => {
      const product = req.body;
      // console.log(product);
      const result = await productCollection.insertOne(product);
      res.send({ success: "Product upload successfully" });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// create API

app.get("/", (req, res) => {
  res.send("Hello This is good food server side");
});

// port listening

app.listen(port, () => {
  console.log("Server Is Running", port);
});
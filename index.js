const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const verify = require("jsonwebtoken/verify");

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
    const orderCollection = client.db("goodFoods").collection("orders");

    // upload product

    app.post("/uploadproduct", async (req, res) => {
      const product = req.body;
      const tokenInfo = req.headers.authorization;
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      // console.log(decoded);

      if (email == decoded.email) {
        // console.log(product);
        const result = await productCollection.insertOne(product);
        res.send({ success: "Product upload successfully" });
      } else {
        res.send({ success: "UnAuthorized Access" });
      }
    });

    // get products

    app.get("/products", async (req, res) => {
      const products = await productCollection.find({}).toArray();
      res.send(products);
    });
    // // get product

    app.get("/product/:productId", async (req, res) => {
      const { productId } = req.params;
      const product = await productCollection.findOne({
        _id: ObjectId(productId),
      });
      res.send(product);
      // console.log(product);
      // console.log(productId);
    });

    // update items
    app.put("/product/:productId", async (req, res) => {
      const { productId } = req.params;
      const quantity = req.body.quantity;
      const product = await productCollection.updateOne(
        {
          _id: ObjectId(productId),
        },
        { $set: { quantity } },
        { upsert: true }
      );
      res.send(product);
      // console.log(product);
      // console.log(productId);
    });

    // delete a product item

    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // add orders

    app.post("/MyItems", async (req, res) => {
      const orderInfo = req.body;
      const result = await orderCollection.insertOne(orderInfo);
      res.send({ success: "order Completed successfully" });
    });

    // My Items list

    app.get("/MyItems", async (req, res) => {
      const tokenInfo = req.headers.authorization;
      // console.log(tokenInfo);
      const [email, accessToken] = tokenInfo.split(" ");
      const decoded = verifyToken(accessToken);
      // console.log(decoded);
      if (email == decoded.email) {
        const orders = await orderCollection.find({ email: email }).toArray();
        res.send(orders);
      } else {
        res.send({ success: "UnAuthorized Access" });
      }
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// create API file

app.post("/login", (req, res) => {
  const email = req.body;
  const token = jwt.sign(email, process.env.ACCESS_TOKEN_KEY);
  res.send({ token });
});

//listing ports

app.get("/", (req, res) => {
  res.send("Hello This is good food server side");
});

// port listening

app.listen(port, () => {
  console.log("Server Is Running", port);
});

// verify token

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_KEY, function (err, decoded) {
    if (err) {
      email = "Invalid";
    } else {
      email = decoded;
    }
  });

  return email;
}

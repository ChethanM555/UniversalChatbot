//create a nodejs server with express
const express = require("express");
const app = express();
const port = 3000;
const bodyParser = require("body-parser");
const cors = require("cors");

//import functions from local scripts
const { router } = require("./langchain");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors());

//create a route
app.get("/", (req, res) => {
  console.log("Hello World!");
  res.json({ message: "Hello World!" });
});

//add routes from langchain.js
app.use("/", router);

//create a server
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const express = require("express");
require("./config");
const product = require("./product");
const cors = require("cors");
const os = require("os");
const net = require('net');


const app = express();
app.use(express.json());
app.use(cors());

app.post("/create", async (req, res) => {
  try {
    let data = new product(req.body);
    let result = await data.save();
    res.send(result);
    console.log("Successfully Create:",result);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

app.get("/todos", async (req, res) => {
  try {
    let data = await product.find();
    res.send(data);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});
app.delete("/delete/:_id", async (req, res) => {
  try {
    let deletedData = await product.findOneAndDelete({ _id: req.params._id });
    res.send(deletedData);
    console.log("Successfully Delete:",deletedData);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});

app.put("/update/:_id", async (req, res) => {
  try {
    const prevProduct = await product.findOne({ _id: req.params._id.trim() });
    await product.updateOne({ _id: req.params._id.trim() }, { $set: req.body });
    const updatedProduct = await product.findOne({ _id: req.params._id.trim() });
    res.send(updatedProduct);
    console.log(`Successfully Updated:\n Previous data:`, prevProduct, "\n Updated data:", updatedProduct);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server error");
  }
});




const MAX_PORT = 65535; // maximum possible port number
let port = 4200;

function findAvailablePort() {
  return new Promise((resolve, reject) => {
    if (port > MAX_PORT) {
      reject(new Error('All ports are busy'));
      return;
    }
    const server = net.createServer();
    server.unref();
    server.on('error', (error) => {
      console.log(`The Port ${port} is busy`);
      port++;
      findAvailablePort().then(resolve).catch(reject);
    });
    server.listen(port, () => {
      server.close(() => {
        resolve(port);
      });
    });
  });
}

findAvailablePort()
  .then(port => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      const interfaces = os.networkInterfaces();
      let addresses = [];
      for (let interface in interfaces) {
        for (let address of interfaces[interface]) {
          if (address.family === "IPv4" && !address.internal) {
            addresses.push(address.address);
          }
        }
      }
      console.log(`Local: http://localhost:${port}`);
      console.log(`Network: http://${addresses[0]}:${port}`);
    });
  })
  .catch(error => {
    console.error(error.message);
  });
import express from "express";

import markRouter from "./app/routes/mark.routes.js";
import studentRouter from "./app/routes/student.routes.js";

import db from "./app/models/index.js";
import { connect } from "nats";
import { receiveMarks } from "./app/utils/nats-funcs.js";

const app = express();

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

db.sequelize.sync()
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

//regiester routes
markRouter(app);
studentRouter(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}.`);
});

//nats
const nc = await connect({ servers: "192.162.246.63:4222"});
console.log(`connected to ${nc.getServer()}`);
const done = nc.closed();
receiveMarks(nc);
const err = await done;
if (err) {
  console.log(`error closing:`, err);
}
await nc.close();


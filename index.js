const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const cors = require("cors");
const auth_routes = require("./routes/auth_users.js").authenticated;
const general_routes = require("./routes/general.js").general;

const app = express();

app.use(express.json());

app.use(cors({
  origin: "*", // Allow requests from your frontend
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow relevant HTTP methods
  credentials: true, // Allow cookies if needed
}));

// const allowedOrigins = [
//   "https://eggonion.github.io/mybookstoress",  
//   "http://localhost:3000",
// ];

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin || allowedOrigins.includes(origin)) {
//         callback(null, true); // Allow the request
//       } else {
//         callback(new Error("Not allowed by CORS")); // Block the request
//       }
//     },
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true, // Allow cookies if needed
//   })
// );

app.use("/", auth_routes);
app.use("/", general_routes);

// Export the app for Vercel
module.exports = app;

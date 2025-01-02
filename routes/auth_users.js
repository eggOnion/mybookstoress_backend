const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let books = require("../services/booksdb");

const regd_users = express.Router();

let users = [];

// Secret key for signing JWTs (keep this secure)
let JWT_SECRET = "your_jwt_secret";

// Check if the username exists in the records
const isValid = (username) => { 
  return users.some((user) => user.username === username);
};

//Check if the username and password match the records
const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username);
  return user && user.password === password;
};

regd_users.post("/login", (req, res) => {
  
  const { username, password } = req.body;

  // Step 1: Validate username and password presence
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Step 2: Check if the username exists
  if (!isValid(username)) {
    return res.status(404).json({ message: "Username not found." });
  }

  // Step 3: Validate the username and password
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Step 4: If valid, generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1m" }); // 1 hour expiration

  // Step 5: Return the token to the client
  return res.status(200).json({ message: "Login successful", token });
});

// -----------------  Middleware to authenticate users using JWT -----------------
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token is required." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.user = user;
    next();
  });
};

// ----------------- ADD/MODIFY a book review -----------------
regd_users.put("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review;
  const username = req.user.username;

  if (!reviewText) {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  const book = books[isbn];
  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = reviewText;
 

  return res.status(200).json({
    message: "Review added or updated successfully.",
    reviews: book.reviews,
  });
});

// ----------------- DELETE a book review -----------------
regd_users.delete("/auth/review/:isbn", authenticateToken, (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  // Check if the user is logged in
  if (!username) {   
    return res
      .status(401)
      .json({ message: "You need to log in to delete a review." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  const book = books[isbn];

  // Check if the book has any reviews
  if (!book.reviews || !book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "You have not submitted a review for this book." });
  }

  // delete the user's review
  delete book.reviews[username];

  return res.status(200).json({
    message: "Your review has been deleted successfully.",
    reviews: book.reviews, // Return the updated reviews
  });
});

// GET a book review
regd_users.get("/auth/review/:isbn", (req, res) => { 
  
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }
  return res.status(200).json({
    message: "Reviews retrieved successfully.",
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

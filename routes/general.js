const express = require("express");
const axios = require("axios");
const bcrypt = require("bcrypt");

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const books = require("../services/booksdb.js");

const public_users = express.Router();

public_users.use("/books", public_users);

// --------------------- REGISTER a new user ---------------------
public_users.post("/register", async (req, res) => {
  //Write your code here
  const { username, password } = req.body; // Extract username and password from request body

  // Check if both username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if the username already exists in the users array
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

   // Hash password before storing
   const hashedPassword = await bcrypt.hash(password, 10);

  // Register the new user
  users.push({ username, password });

  // Return success message
  return res.status(201).json({ message: "User successfully registered" });
});


//  --------------------- GET all books via Method Chaining ---------------------
public_users.get("/", (req, res) => {
  res.json(books); // Send the books database as a JSON response
});

//  --------------------- GET books by isbn (Promises w/callback) ---------------------
public_users.get("/isbn/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extract ISBN from the route parameter

  // Wrapping the logic in a Promise
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]); // Resolve if the book exists
    } else {
      reject("Book not found for the given ISBN."); // Reject if the book does not exist
    }
  })
    .then((book) => {
      // Handle the resolved case (book found)
      res.status(200).json(book);
    })
    .catch((error) => {
      // Handle the rejected case (book not found)
      res.status(404).json({ message: error });
    });
});

//  --------------------- GET books by author (Promises w/callback) ---------------------
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.replace(/\s+/g, "").toLowerCase(); // Extract and normalize the author name

  // Wrap the logic in a Promise
  new Promise((resolve, reject) => {
    const booksByAuthor = [];

    // Iterate through the books object to find books by the specified author
    for (const isbn in books) {
      const bookAuthor = books[isbn].author.replace(/\s+/g, "").toLowerCase();
      if (bookAuthor.includes(author)) {
        booksByAuthor.push({ isbn, ...books[isbn] });
      }
    }

    // Resolve or reject based on whether books by the author were found
    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject(`No books found by the author: ${author}`);
    }
  })
    .then((booksByAuthor) => {
      // Handle the success case
      res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      // Handle the error case
      res.status(404).json({ message: error });
    });
});

//  --------------------- GET books by title (Promises w/callback) ---------------------
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.replace(/\s+/g, "").toLowerCase(); // Normalize the title input

  // Wrap the logic in a Promise
  new Promise((resolve, reject) => {
    const booksWithTitle = [];

    // Iterate through the books object to find books with matching titles
    for (const isbn in books) {
      const bookTitle = books[isbn].title.replace(/\s+/g, "").toLowerCase();
      if (bookTitle.includes(title)) {
        booksWithTitle.push({ isbn, ...books[isbn] });
      }
    }

    // Resolve or reject based on whether matching books are found
    if (booksWithTitle.length > 0) {
      resolve(booksWithTitle);
    } else {
      reject(`No books found with the title: ${title}`);
    }
  })
    .then((booksWithTitle) => {
      // Handle the resolved case
      res.status(200).json(booksWithTitle);
    })
    .catch((error) => {
      // Handle the rejected case
      res.status(404).json({ message: error });
    });
});

//  ------------------------ GET books by Review via ISBN (Local Function) ------------------------
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const isbn = req.params.isbn; // Extract ISBN from the route parameter

  // Check if the book exists in the database
  if (books[isbn]) {
    // If the book exists, return the reviews
    return res.status(200).json({ reviews: books[isbn].reviews });
  } else {
    // If the book doesn't exist, return a 404 error
    return res
      .status(404)
      .json({ message: `No reviews found for the book with ISBN: ${isbn}` });
  }
});

module.exports.general = public_users;

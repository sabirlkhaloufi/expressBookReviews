const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "sabir",
    password: "sabir123",
  },
];

const isValid = (username) => {
  let isValid = false;
  users.forEach((user) => {
    if (user.username === username) {
      isValid = true;
    }
  });
  return isValid;
};

const authenticatedUser = (username, password) => {
  let isValid = false;
  users.forEach((user) => {
    if (user.username === username && user.password === password) {
      isValid = true;
    }
  });
  return isValid;
};

const checkReviewIsExist = (book, username) => {
  let review = false;

  for (const reviewId in books[book].reviews) {
    if (books[book].reviews[reviewId].username === username) {
      review = books[book].reviews[reviewId].review;
    }
  }
  return review;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "invalid username" });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, "123");
    req.session.accessToken = accessToken;
    return res.status(200).json({ message: "Logged in successfully" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;

  if (!req.session.accessToken) {
    return res
      .status(401)
      .json({ message: "Unauthorized. Please log in first" });
  }

  const username = jwt.decode(req.session.accessToken).username;

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (checkReviewIsExist(isbn, username)) {
    // Modify the existing review
    checkReviewIsExist(isbn, username).review = review;
  } else {
    // Add a new review
    book.reviews.push({ username, review });
  }

  return res
    .status(200)
    .json({ message: "Review added or modified successfully" });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Check if the user is authenticated
  if (!req.session.accessToken) {
    return res.status(401).json({ message: "Unauthorized. Please log in first" });
  }

  const username = jwt.decode(req.session.accessToken).username;

  // Find the book by ISBN
  const book = books[isbn];

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has already reviewed this book
  let existingReviewIndex = false;

  for (const reviewId in books[isbn].reviews) {
    if (books[isbn].reviews[reviewId].username === username) {
      existingReviewIndex = reviewId;
    }
  }

  if (existingReviewIndex !== -1) {
    // Remove the review from the array
    delete books[isbn].reviews[existingReviewIndex];
    // books[isbn].reviews.splice(existingReviewIndex, 1);
    return res.status(200).json({ message: "Review deleted successfully" });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');  // Import Axios
const public_users = express.Router();




public_users.post("/register", (req,res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
  
    users.forEach(user => {
      if (user.username === username) {
        return res.status(400).json({ message: 'Username already exists' })
      }
    });
  
    // Here, you can add the new user to the 'users' array
    users.push({ username, password });
  
    return res.status(201).json({ message: 'User registered successfully' });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
   // Assuming 'books' is an array of book objects
  //  const bookList = books.map((book) => ({
  //   title: book.title,
  //   author: book.author,
  //   ISBN: book.isbn,
  // }));
  return res.status(200).json(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: 'Book not found' });
    }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;
    let foundBooks = [];

for (const bookId in books) {
  if (books.hasOwnProperty(bookId) && books[bookId].author === author) {
    foundBooks.push(books[bookId]);
  }
}
    if (foundBooks.length > 0) {
      return res.status(200).json(foundBooks);
    } else {
      return res.status(404).json({ message: 'No books by this author' });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    let foundBook = null;

    for (const bookId in books) {
      if (books.hasOwnProperty(bookId) && books[bookId].title === title) {
        foundBook = books[bookId];
        break;
      }
    }    
    if (foundBook != null) {
      return res.status(200).json(foundBook);
    } else {
      return res.status(404).json({ message: 'No books with this title' });
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    const bookReviews = books[isbn].reviews;

    if (Object.keys(bookReviews).length > 0) {
      return res.status(200).json(bookReviews);
    } else {
      return res.status(200).json({ message: 'No reviews found for this book' });
    }
  } else {
    return res.status(404).json({ message: 'Book not found with the specified ISBN' });
  }
});


// axios
public_users.get('/', async function (req, res) {
    try {
      const response = await axios.get('http://localhost:5000/'); // Replace with the actual API URL
      const bookList = response.data;
      return res.status(200).json(bookList);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching book list' });
    }
  });
  
  // Task 11: Get book details based on ISBN using Axios with Promises
  public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    try {
      const response = await axios.get(`http://localhost:5000/${isbn}`); // Replace with the actual API URL
      const book = response.data;
      return res.status(200).json(book);
    } catch (error) {
      return res.status(404).json({ message: 'Book not found' });
    }
  });
  
  // Task 12: Get book details based on author using Axios with Promises
  public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    try {
      const response = await axios.get(`http://localhost:5000/?author=${author}`); // Replace with the actual API URL
      const booksByAuthor = response.data;
      return res.status(200).json(booksByAuthor);
    } catch (error) {
      return res.status(404).json({ message: 'No books by this author' });
    }
  });
  
  // Task 13: Get all books based on title using Axios with Promises
  public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    try {
      const response = await axios.get(`http://localhost:5000/?title=${title}`); // Replace with the actual API URL
      const booksWithTitle = response.data;
      return res.status(200).json(booksWithTitle);
    } catch (error) {
      return res.status(404).json({ message: 'No books with this title' });
    }
  });
  
  // ... The rest of the code ...

module.exports.general = public_users;

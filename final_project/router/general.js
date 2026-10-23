const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router(); // <-- Обязательно должна быть здесь, ДО любых методов .get()

// Регистрация нового пользователя
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required for registration" });
  }

  if (users.some((user) => user.username === username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username: username, password: password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Получение списка всех книг (Task 1)
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Получение книги по ISBN (Task 2)
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
  
// Получение книг по автору (Task 3)
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author.toLowerCase();
  let filteredBooks = [];
  
  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      filteredBooks.push(books[isbn]);
    }
  });

  if (filteredBooks.length > 0) {
    return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
  } else {
    return res.status(404).json({ message: "Books by this author not found" });
  }
});

// Получение книг по названию (Task 4)
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title.toLowerCase();
  let filteredBooks = [];

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase().includes(title)) {
      filteredBooks.push(books[isbn]);
    }
  });

  if (filteredBooks.length > 0) {
    return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
  } else {
    return res.status(404).json({ message: "Books with this title not found" });
  }
});

// Получение отзывов на книгу (Task 5)
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});


// --- АСИНХРОННЫЕ ВЕРСИИ С PROMISES / AXIOS (Задачи 10 - 13 / Question 11) ---

public_users.get('/server/books', async function (req, res) {
  try {
    const getBooks = new Promise((resolve, reject) => {
      resolve(books);
    });
    const responseBooks = await getBooks;
    return res.status(200).json(responseBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

public_users.get('/server/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const getBookByIsbn = new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book not found"));
      }
    });
    const book = await getBookByIsbn;
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/server/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase();
  try {
    const getBooksByAuthor = new Promise((resolve, reject) => {
      let filteredBooks = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].author.toLowerCase() === author) {
          filteredBooks.push(books[isbn]);
        }
      });
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Books by this author not found"));
      }
    });
    const booksList = await getBooksByAuthor;
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

public_users.get('/server/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase();
  try {
    const getBooksByTitle = new Promise((resolve, reject) => {
      let filteredBooks = [];
      Object.keys(books).forEach((isbn) => {
        if (books[isbn].title.toLowerCase().includes(title)) {
          filteredBooks.push(books[isbn]);
        }
      });
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Books with this title not found"));
      }
    });
    const booksList = await getBooksByTitle;
    return res.status(200).json(booksList);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});

module.exports.general = public_users;
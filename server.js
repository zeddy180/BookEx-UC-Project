const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bookSharing', { useNewUrlParser: true, useUnifiedTopology: true });

// Define Book schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  filePath: String,
  forSale: Boolean,
  forExchange: Boolean,
  price: Number,
});

const Book = mongoose.model('Book', bookSchema);

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

app.use(express.json());

// Upload a book
app.post('/upload', upload.single('book'), (req, res) => {
  const { title, author, forSale, forExchange, price } = req.body;
  const newBook = new Book({
    title,
    author,
    filePath: req.file.path,
    forSale: forSale === 'true',
    forExchange: forExchange === 'true',
    price: parseFloat(price),
  });

  newBook.save()
    .then(() => res.status(201).send('Book uploaded successfully'))
    .catch(err => res.status(400).send(err.message));
});

// Get all books
app.get('/books', (req, res) => {
  Book.find()
    .then(books => res.json(books))
    .catch(err => res.status(400).send(err.message));
});

// Buy a book
app.post('/buy/:id', (req, res) => {
  const { id } = req.params;
  Book.findById(id)
    .then(book => {
      if (book.forSale) {
        // Implement payment logic here
        res.send(`Book purchased: ${book.title}`);
      } else {
        res.status(400).send('Book is not for sale');
      }
    })
    .catch(err => res.status(400).send(err.message));
});

// Exchange a book
app.post('/exchange/:id', (req, res) => {
  const { id } = req.params;
  Book.findById(id)
    .then(book => {
      if (book.forExchange) {
        // Implement exchange logic here
        res.send(`Book exchanged: ${book.title}`);
      } else {
        res.status(400).send('Book is not available for exchange');
      }
    })
    .catch(err => res.status(400).send(err.message));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

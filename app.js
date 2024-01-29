
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const csv = require('csv-parser');
const fs = require('fs');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Middleware to handle CSV data
const csvData = [];
fs.createReadStream('./public/points.csv')
  .pipe(csv())
  .on('data', (row) => {
    csvData.push(row);
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// Endpoint to serve sorted CSV data
app.get('/api/data', (req, res) => {
  // Sort the CSV data before sending it
  const sortedData = csvData.sort((a, b) => b['r'] - a['r']);
  res.json(sortedData);
});


// Existing middleware and route setup
app.use('/users', usersRouter);

// 404 error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Global error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env');
  res.status(err.status || 500);
  res.render('error');
});

// Export the app
module.exports = app;
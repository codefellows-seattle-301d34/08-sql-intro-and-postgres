'use strict';

const fs = require('fs');
const pg = require('pg');
const express = require('express');

const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
const conString = 'postgres://postgres:password@localhost:5432/postgres';

// Mac:
// const conString = 'postgres://localhost:5432';

const client = new pg.Client(conString);

// DONE: Use the client object to connect to our DB.
client.connect();


// DONE: Install the middleware plugins so that our app can parse the request body
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('./public'));


// DONE: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // This is number 2 on the full-stack-diagram. The client is making a request to the server. This piece does not interact with any part of article.js, but will respond when typed into the URL. This is the READ part of CRUD.
  response.sendFile('new.html', {root: './public'});
});


// DONE: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This get request is part 3 of the MVC diagram. The server is querying the database. This is perfomed when the view performs a get request with the path '/articles'. This is called from the fetchAll() method in article.js. This is the READ part of CRUD.
  client.query('SELECT * FROM articles;')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This also part 3 of the full-stack-diagram. The server is making a query to the database. In this case, the query is to insert data into the database. This is called from insertRecord() in article.js, and is the CREATE part of CRUD.
  let SQL = `
    INSERT INTO articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  let values = [
    request.body.title,
    request.body.author,
    request.body.authorUrl,
    request.body.category,
    request.body.publishedOn,
    request.body.body
  ]

  client.query( SQL, values )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is part 3 of the full-stack-diagram. The server is querying the database in order to update the table. This functionality is called from updateRecord() in article.js, and is represented by UPDATE in CRUD.

  let SQL = 'UPDATE articles SET title=$2, author=$3, "authorUrl"=$4, category=$5, "publishedOn"=$6, body=$7 WHERE article_id=$1;';
  let values = [
    request.params.id,
    request.body.title,
    request.body.author,
    request.body.authorUrl,
    request.body.category,
    request.body.publishedOn,
    request.body.body,
  ];

  client.query( SQL, values )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is part 3 in the full-stack-diagram. The server is querying a deletion from the database. This is enacted from the method deleteRecord() in article.js. This represents DELETE in CRUD.

  let SQL = `DELETE FROM articles WHERE article_id=$1;`;
  let values = [request.params.id];

  client.query( SQL, values )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is part 3 in the full-stack-diagram. The server is querying a deletion from the database. This interacts with truncateTable() in article.js. This is DELETE in CRUD.

  let SQL = 'DROP TABLE articles;';
  client.query( SQL )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// DONE: What is this function invocation doing?
// This is calling the function create a table and it's fields when this file is loaded.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is part 3 of the full-stack-diagram. The server is querying the database to see if there is content in the table. If there is not, new rows are inserted. This function first performs the READ, and potentially performs the CREATE portions of CRUD.

  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query( SQL )
    .then(result => {
    // DONE: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if(!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            let SQL = `
              INSERT INTO articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `;
            let values = [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body];
            client.query( SQL, values );
          })
        })
      }
    })
}

function loadDB() {
  // DONE: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is part 3 of the full-stack-diagram. The server is querying the database to create a new table if that table does not already exist. This functions creates the table that article.js ultimately utilizes to store and retrieve articles. This is called when server.js is loaded, and is represented by CREATE in CRUD.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}

'use strict';

const fs = require('fs');
const express = require('express');
const pg = require('pg');

const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
// const conString = 'postgres://USER:PASSWORD@HOST:PORT/DBNAME';

// Mac:
const conString = 'postgres://localhost:5432/kilovolt';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can parse the request body
app.use(express.urlencoded());
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new-article', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  //.get corresponds to #2
  //response.sendFile... corresponds to #5
  //There's nothing in article.js that corresponds with this. Its triggered when the user add /new-article to end of the URL.
  response.sendFile('new.html', {root: './public'});
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This would be the READ portion of CRUD.
  // app.get(/'articles...) corresponds with step 2
  // client.query() corresponds with steps 3
  // .then corresponds with step 4
  // response.send(...) corresponds with step 5
  console.log('request for articles from client');
  client.query('SELECT * FROM articles;')
    .then(function(result) {
      console.log('request for articles completed. Sending to client');
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // app.post == diagram #2
  // client.query (below) == diagram #3
  // .then (below) == diagram #4
  // response.send == diagram #5
  // this piece of server is listening for requests from article.js method insertRecord()
  // This would be the CREATE part of CRUD.

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
      response.send('article insertion complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // app.put == diagram #2
  // client.query (below) == diagram #3
  // .then (below) == diagram #4
  // response.send == diagram #5
  // this piece of server is listening for requests from article.js method updateRecord()
  // This would be the UPDATE part of CRUD.

  let SQL = `\
  UPDATE articles\
  SET author = $2,\
      title = $3,\
      "authorUrl" = $4,\
      category = $5,\
      "publishedOn" = $6,\
      body = $7\
  WHERE article_id = $1;`;
 
  let values = [request.params.id,
  request.body.author,
  request.body.title,
  request.body.authorUrl,
  request.body.category,
  request.body.publishedOn,
  request.body.body];

  client.query( SQL, values )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // app.delete == diagram #2
  // client.query (below) == diagram #3
  // .then (below) == diagram #4
  // response.send == diagram #5
  // this piece of server is listening for requests from article.js method deleteRecord();
  // This would be the DELETE part of CRUD.

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
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // app.delete == diagram #2
  // client.query (below) == diagram #3
  // .then (below) == diagram #4
  // response.send == diagram #5
  // this piece of server is listening for requests from article.js method truncateTable();
  // This would be the DELETE part of CRUD.

  let SQL = 'TRUNCATE TABLE articles';
  client.query( SQL )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// This functions is creating the table if it doesn't exist, then it calls loadArticles function which reads data from public/data/hackerIpsum.json and inserts into the new table (DB).
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // client.query corresponds to #3
  //.then corresponds to  #4
  //There is no method in article.js that makes reference to this function.
  //From the CRUD, this corresponds to CREATE.


  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query( SQL )
    .then(result => {
    // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
    // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
    // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      console.log(result.rows);
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
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // client.query() corresponds to number 3 in the full-stack-diagram. There is no method in article.js that is conected to this specific part of server.js. Among create, read, update, delete, this is CREATE.

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

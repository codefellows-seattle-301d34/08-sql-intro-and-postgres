'use strict';

const fs = require( 'fs' );
const express = require( 'express' );
const pg = require( 'pg' );
const PORT = process.env.PORT || 3000;
const app = express();

// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
const conString = 'postgres://postgres:Sadie12!@@localhost:5432/kilovolt';

// Mac:
// const conString = 'postgres://localhost:5432';

const client = new pg.Client( conString );

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can parse the request body
app.use( express.json() );
app.use( express.urlencoded() );
app.use( express.static( './public' ) );


// REVIEW: Routes for requesting HTML resources
app.get( '/new-article', ( request, response ) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js, if any, is interacting with this particular piece of `server.js`? What part of CRUD, if any, is being enacted/managed by this particular piece of code?
  // This is #5 in the MVC diagram. This does not appear to be listening for any method that is currently created. Get is related to Read on CRUD.
  response.sendFile( 'new.html', { root: './public' } );
} );


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get( '/articles', ( request, response ) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is #5 in the MVC diagram. This is listening for Articles.fetchAll whose function includes $.get('/articles'). Get is related to Read on CRUD.
  client.query( 'SELECT * FROM articles;' )
    .then( function( result ) {
      response.send( result.rows );
    } )
    .catch( function( err ) {
      console.error( err )
    } )
} );

app.post( '/articles', ( request, response ) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // The direct line of code below is just declaring a variable SQL that we will use later on  in this function to make a query. The direct line of code below does not show on the MVC diagram however, the  client.query is #3 since the server is requesting the model to do something.  client.query is the Create part of CRUD. This is interacting with the Article.prototype.insertRecord on article.js
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
    .then( function() {
      response.send( 'insert complete' )
    } )
    .catch( function( err ) {
      console.error( err );
    } );
} );

app.put( '/articles/:id', ( request, response ) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is the Update part of Crud. We believe this is updateding the querey and array by clearing their contents.  This would be 3, 4, and 5 of the MVC Diagram. This is interacting with Article.prototype.updateRecord on article.js

  let SQL = 'UPDATE articles SET author=$1, "authorUrl"=$2, body=$3, category=$4, "publishedOn"=$5, title=$6 WHERE article_id=$7;';
  let values = [
    request.body.author,
    request.body.authorURl,
    request.body.body,
    request.body.category,
    request.body.publishedOn,
    request.body.title,
    request.params.id
  ];

  client.query( SQL, values )
    .then( () => {
      response.send( 'update complete' )
    } )
    .catch( err => {
      console.error( err );
    } );
} );

app.delete( '/articles/:id', ( request, response ) => {
  // COMMENTED: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is the delete/destroy part of CRUD. On the MVC Diagram 3 is the query requsting the delete, 4 is when the article is deleted, and 5 is when we send back the response that the delete was successful. This is interacting with Article.prototype.deleteRecord on article.js

  let SQL = `DELETE FROM articles WHERE article_id=$1;`;
  let values = [ request.params.id ];

  client.query( SQL, values )
    .then( () => {
      response.send( 'Delete complete' )
    } )
    .catch( err => {
      console.error( err );
    } );
} );

app.delete( '/articles', ( request, response ) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is interacting with the Article.truncateTable on articles.js. This is the Delete/Destroy part of CRUD. This is number 3 for the querey, 4 for the action, and 5 for the response of Delete complete.

  let SQL = '';
  client.query( SQL )
    .then( () => {
      response.send( 'Delete complete' )
    } )
    .catch( err => {
      console.error( err );
    } );
} );

// COMMENT: What is this function invocation doing?
// This is creating a table if nothing exists and then loading the articles if they do not exist.
loadDB();

app.listen( PORT, () => {
  console.log( `Server started on port ${PORT}!` );
} );


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is 3 & 4 of the MVC Diagram. It is interacting with the loadDB function. This is the Create part of CRUD.

  let SQL = 'SELECT COUNT(*) FROM articles';
  client.query( SQL )
    .then( result => {
      // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if ( !parseInt( result.rows[ 0 ].count ) ) {
        fs.readFile( './public/data/hackerIpsum.json', 'utf8', ( err, fd ) => {
          JSON.parse( fd ).forEach( ele => {
            let SQL = `
              INSERT INTO articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `;
            let values = [ ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body ];
            client.query( SQL, values );
          } )
        } )
      }
    } )
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This doesn't say POST but that is what it is doing by creating the table.  This involves the Create version of CRUD. On the MVC Diagram 3 & 4.
  client.query( `
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`
  )
    .then( () => {
      loadArticles();
    } )
    .catch( err => {
      console.error( err );
    } );
}

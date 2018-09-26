require('dotenv').config()
const express = require("express"),
      mysql = require("mysql"),
      bodyParser = require("body-parser");

      var app = express();
      const NODE_PORT = process.env.PORT;
 /**
       * DB_HOST='localhost"
       * DB_PORT=3306
       * user=root
       * password=
       * database=sakilla
       * 4
       */

      var pool = mysql.createPool({
          host: process.env.DB_HOST,
          port: process.env.DB_PORT,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          connectionLimit: process.env.DB_CONLIMIT
          //debug: true
      })

      console.log("DN USER : " + process.env.DB_USER);
      console.log("DB NAME : " + process.env.DB_NAME);

      const sqlFindAllBooks = "SELECT * FROM books LIMIT ? OFFSET ?";  //need space after LIMIT and OFFSET before ?
      const sqlFindOneBook = "SELECT idbooks, name, author, publish_year, isbn FROM books WHERE idbooks=?";

      var makeQuery = (sql, pool) => {
          console.log(sql);

          return (args) => {
              let queryPromise = new Promise((resolve, reject) => {
                  pool.getConnection((err, connection) => {
                      if(err) {
                          reject(err);
                          return;
                      }
                      console.log(args);

                      connection.query(sql, args || [], (err, results) => {  
                          connection.release();
                          if(err) {
                              reject(err);
                              return;
                          }
                          console.log(">>> ", + results);
                          resolve(results);
                      })
                  });
              });
              return queryPromise;
          }
      }

      var findAllBooks = makeQuery(sqlFindAllBooks, pool);
      var findOneBookById = makeQuery(sqlFindOneBook, pool);

      app.use(bodyParser.urlencoded({ extended: false }));
      app.use(bodyParser.json());

      app.get("/books", (req, res) => {
          console.log("/books query !");
          var bookId = req.query.bookId;
          console.log(bookId);
          if(typeof(bookId) === 'undefined') {
              console.log(">>>" + bookId);
              findAllBooks([5,5]).then((results) => {
                  console.log(results);
                  res.json(results);
              }).catch((error) => {
                  res.status(500).json(error);
              });
          } else {
              console.log(bookId);
              findOneBookById([parseInt(bookId)]).then((results) => {
                  console.log(results);
                  res.json(results);
              }).catch((error) => {
                  console.log(error);
                  res.status(500).json(error);
              });
         
     
        }
      })

      app.get('/books/:bookId', (req, res) => {
        console.log("/books param !");
        let bookId = req.params.bookId;
        console.log(bookId);
        findOneBookById([parseInt(bookId)]).then((results) => {
            console.log(results);
            res.json(results);
        }).catch((error) => {
            res.status(500).json(error);
        })
            
        });

        
      app.listen(NODE_PORT, () => {
          console.log(`Listening to server at ${NODE_PORT}`)
      })
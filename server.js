const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const { query } = require('express');
const app = express();
const dotenv = require('dotenv').config({
    path: './secrets/.env'
})
const connectionsString = process.env.dbConnection





//db
MongoClient.connect(connectionsString, {
        //useUnifiedTopology: true
    })
    .then(client => {
        console.log("Connected to Database")
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')
        //template engine
        app.set('view engine', 'ejs')

        //parser
        app.use(bodyParser.urlencoded({ extended: true }))
        app.use(express.static('public'))
        app.use(bodyParser.json())

        //handler
        app.get('/', (req, res) => {
            const cursor = db.collection('quotes').find().toArray()
            .then(results => {
                res.render('index.ejs', { quotes: results})
                //console.log(results)
            })
            .catch(error => console.error(error))
            //console.log(cursor)
            //res.render('index.ejs', {})
            //res.sendFile(__dirname + "/index.html")
        })
        
        app.post('/quotes', (req, resp) => {
            quotesCollection.insertOne(req.body)
            .then(result => {
                //console.log(result)
                resp.redirect('/')
            })
            .catch(error => console.error(error))
        })

       app.put('/quotes', (req, res) => {
           //console.log(req.body)
           quotesCollection.findOneAndUpdate(
               {name: 'Yoda'},
               {
                   $set: {
                       name: req.body.name,
                       quote: req.body.quote
                   }
               },
               {
                   upsert: true
               }
           )
           .then(result => {
                res.json('Success')
           })
           .then(response => {
            console.log(response)
          })
          .catch(error => console.error(error))
       })

       app.delete('/quotes', (req, res) => {
        quotesCollection.deleteOne(
            { name: req.body.name }
        )
        .then(result => {
            if (result.deletedCount === 0) {
                return res.json('No quote to delete')
              }
              res.json(`Deleted Darth Vadar's quote`)
        })
        .catch(error => console.error(error))
      })
        
        //listener
        app.listen(3000, function(){
            console.log("listening on port 3000")
        })
    })
    .catch(error => console.error(error))





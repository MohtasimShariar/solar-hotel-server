const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0q8xi.mongodb.net/solar?retryWrites=true&w=majority`;

const port = 8000

const app = express()

app.use(cors());
app.use(bodyParser.json());





var serviceAccount = require("./configs/solar-hotel-firebase-adminsdk-qk7pv-7907459722.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookings = client.db("solar").collection("bookings");
  // perform actions on the collection object

  app.post('/addBooking', (req, res) => {
    const newBooking = req.body;
    bookings.insertOne(newBooking)
      .then(result => {
        res.send(result.insertedCount > 0);
      })

  })


  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];

      // idToken comes from the client app
      admin.auth().verifyIdToken(idToken)
        .then(function (decodedToken) {
          const tokenEmail = decodedToken.email;
          const queryEmail = req.query.email
          if (tokenEmail == queryEmail) {
            bookings.find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              })

          }
          else {
            res.status(401).send('Unauthorized access')
          }
        }).catch(function (error) {
          // Handle error
          res.status(401).send('Unauthorized access')
        });
    }
    else {
      res.status(401).send('Unauthorized access')

    }

  })

});


// app.get('/bookings', (req, res) => {
//   const bearer = req.headers.authorization;
//   if (bearer && bearer.startsWith('Bearer ')) {
//     const idToken = bearer.split(' ')[1];

//     // idToken comes from the client app
//     admin.auth().verifyIdToken(idToken)
//       .then(function (decodedToken) {
//         const tokenEmail = decodedToken.email;
//         const queryEmail = req.query.email;

//         if (tokenEmail == queryEmail) {
//           bookings.find({ queryEmail})
//             .toArray((err, documents) => {
//               res.status(200).send(documents);
//             })

//         }
//         else{
//           res.status(401).send('Unauthorized access')
//         }
//       }).catch(function (error) {
//         // Handle error
//         res.status(401).send('Unauthorized access')
//       });
//   }
//   else{
//     res.status(401).send('Unauthorized access')

//   }

// })


// app.get('/bookings', (req, res) => {
//   const bearer = req.headers.authorization;
//   if (bearer && bearer.startsWith('Bearer ')) {
//     const idToken = bearer.split(' ')[1];
//     console.log({ idToken });
//     // idToken comes from the client app
//     admin.auth().verifyIdToken(idToken)
//       .then(function (decodedToken) {
//         const tokenEmail = decodedToken.email;
//         if (tokenEmail == req.query.email) {
//           bookings.find({ email: req.query.email })
//             .toArray((err, documents) => {
//               res.send(documents);
//             })

//         }
//       })
//       .catch(function (error) {
//         // Handle error
//       });
//   }

// })




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

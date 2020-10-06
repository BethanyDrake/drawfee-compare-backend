
var AWS = require("aws-sdk");
var express = require('express');
var app = express();
var bodyParser = require('body-parser');


AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});
app.use(bodyParser.json());

app.post('/vote', function (req, res) {
   // First read existing users.
   console.log("winner: " +req.body.winner)
   console.log("loser: " + req.body.loser)
   res.status(200).end()

})

app.get('/vote', function (req, res) {
  // First read existing users.

  console.log(req.query.id1)
  console.log(req.query.id2)

  const results = {}
  results[req.query.id1] = 5
  results[req.query.id2] = 2
  res.status(200).send(results)
  res.end()

})

var server = app.listen(8082, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})



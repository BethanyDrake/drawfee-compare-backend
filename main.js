
var AWS = require("aws-sdk");
var express = require('express');
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser');
var corsOptions = {
  origin: "http://localhost:8081",
  optionsSuccessStatus: 200,  // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true

}
app.use(cors(corsOptions))

AWS.config.getCredentials(function(err) {
  if (err) console.log(err.stack);
  // credentials not loaded
  else {
    console.log("Access key:", AWS.config.credentials.accessKeyId);
  }
});
app.use(bodyParser.json());
app.options('*', cors(corsOptions))

app.post('/vote', function (req, res) {
  res.header("access-control-allow-origin", "http://localhost:8081"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Method", "*");


  const results = {}
  results[req.body.winner] = 5
  results[req.body.loser] = 2
   console.log("post")
   console.log("winner: " +req.body.winner)
   console.log("loser: " + req.body.loser)
   res.status(200).send(results).end()

})


var server = app.listen(8082, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})




var AWS = require("aws-sdk");
var express = require('express');
var cors = require('cors')
var app = express();
var bodyParser = require('body-parser');

var whitelist = ['http://localhost:8081', 'https://drawfee-compare.vercel.app', 'https://drawfee-royale.vercel.app']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS: '+ origin))
    }
  },
  optionsSuccessStatus: 200,  // some legacy browsers (IE11, various SmartTVs) choke on 204
  credentials: true

}
app.use(cors(corsOptions))
AWS.config.update({region: "ap-southeast-2"})

app.use(bodyParser.json());
app.options('*', cors(corsOptions))

var docClient = new AWS.DynamoDB.DocumentClient();
function updateVoteCount(winner, loser, newCount) {
  console.log("updateVoteCount" + JSON.stringify({winner, loser, newCount}));
  var params = {
      TableName :"drawfee-2",
      Key:{
          winner, loser
      },
      UpdateExpression: "set voteCount = voteCount + :val",
      ExpressionAttributeValues:{
        ":val":1
    },
      ReturnValues:"UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
      if (err) {
          console.log( "Unable to update item: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        // console.log("update succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
      }
  });
}

function create(winner, loser) {
  console.log("creating" + JSON.stringify({winner, loser}));
  var params = {
      TableName :"drawfee-2",
      Item:{
          winner, loser, voteCount: 0
      },
  };
  docClient.put(params, function(err, data) {
      if (err) {
          console.log( "Unable to add item: " + "\n" + JSON.stringify(err, undefined, 2));
      } else {
        // console.log("PutItem succeeded: " + "\n" + JSON.stringify(data, undefined, 2));
      }
  });
}

async function getResults() {
  console.log("getting results");
  var table = "drawfee-2";

  var params = {
      TableName: table,
      ProjectionExpression: "winner, loser, voteCount",

  };
  let resolve;
  const promise = new Promise((res) => {
    resolve = res
  })
  docClient.scan(params, function(err, data) {
    if (err) {
      err.statusCode
      console.log( "Unable to get item: " + "\n" + JSON.stringify(err, undefined, 2));
      create(winner, loser)
    resolve(0)
  } else {
   console.log(data.Items)
   resolve(data.Items)
  }

  });
  return promise;

}

async function getVotes(winner, loser) {
  console.log("getVotes" + JSON.stringify({winner, loser}));
  var table = "drawfee-2";

  var params = {
      TableName: table,
      Key:{
          winner, loser
      }
  };
  let resolve;
  const promise = new Promise((res) => {
    resolve = res
  })
  docClient.get(params, function(err, data) {
    if (err) {
      err.statusCode
      console.log( "Unable to get item: " + "\n" + JSON.stringify(err, undefined, 2));
      create(winner, loser)
    resolve(0)
  } else {
    if (data.Item && data.Item.voteCount !== undefined) {
      resolve(data.Item.voteCount )

    } else {
      create(winner, loser)
      resolve(0)
    }
  }

  });
  return promise;
}

app.get('/results', async function (req, res) {
  const results = await getResults()

  res.status(200).send(results).end()
});

app.post('/vote', async function (req, res) {
  // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Method", "*");

  const oldVotesFor = await getVotes(req.body.winner, req.body.loser)
  const oldVotesAgainst = await getVotes(req.body.loser, req.body.winner)
  console.log({oldVotesFor,oldVotesAgainst })
  updateVoteCount(req.body.winner, req.body.loser, oldVotesFor + 1)

  const results = {}
  results[req.body.winner] = oldVotesFor+1
  results[req.body.loser] = oldVotesAgainst
   res.status(200).send(results).end()

})

app.get('/hello', async function (req, res) {
   res.status(200).send("hey there!").end()

})


var server = app.listen(process.env.PORT || 8082, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})



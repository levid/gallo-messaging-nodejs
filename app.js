// Define dependencies
var express = require('express'),
    http    = require('http'),
    faye    = require('faye');

// Mount Faye Adapter
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

// Create & Configure express app
var app = express();
app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static(__dirname + '/public'));
});

// Allow Cross Domain Access
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

// Configure Post route to Faye
app.post('/faye', function(req, res) {
  adapter.getClient().publish("/messages/new/" + req.body.session_id, { text: req.body.message });
  console.log('broadcast message:' + req.body.message);
  console.log('broadcast session:' + req.body.session_id);
  res.send(200);
});

// Handle non-Bayeux requests
app.get('/', function(req, res) {
  // res.write('Hello, non-Bayeux request');
  res.send(200);
});

var server = http.createServer(app);
bayeux.attach(server);

var port = process.env.PORT || 8000;
server.listen(port, function() {
  console.log("Listening on " + port);
});

var fayeToken = "anything";
var serverAuth = {
  incoming: function(message, callback) {
    // Let non-subscribe messages through
    if (message.channel.indexOf("/meta/") !== 0){
      if (!message.data.ext || fayeToken !== message.data.ext.auth_token){
        message.error = 'Invalid auth token';
      }
    }   
    callback(message);
  }
};

bayeux.addExtension(serverAuth);
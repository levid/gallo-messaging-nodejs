var http = require('http'),
    faye = require('faye');

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});

// Handle non-Bayeux requests
var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.write('Hello, non-Bayeux request');
  response.end();
});
bayeux.attach(server);

var port = process.env.PORT || 8000;
server.listen(port, function() {
  console.log("Listening on " + port);
});

var fayeToken = "anything";

var serverAuth = {
  incoming: function(message, callback) {
    console.log("message:");
    console.log(message);
    // Let non-subscribe messages through
    if (message.channel.indexOf("/meta/") !== 0){
      console.log("channel:");
      console.log(message.channel);
      if (!message.ext || fayeToken !== message.ext.auth_token){
        message.error = 'Invalid auth token';
      }
    }   
    callback(message);
  }
};

// var serverAuth = {
//   incoming: function(message, callback) {
//     console.log(message);
//     // Let non-subscribe messages through
//     if (message.channel.indexOf("/meta/") !== 0){
//       if (fayeToken !== message.ext.auth_token){
//           message.error = 'Invalid auth token';
//       }
//     }   
//     callback(message);
//   }
// };

bayeux.addExtension(serverAuth);
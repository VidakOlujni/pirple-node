
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

var decoder = new StringDecoder('utf-8');
var handlers = {};

handlers.hello = function(data, callback){
  callback(406, {'name': 'hello world handler', 'data': data});
};
handlers.notFound = function(data, callback){
  callback(404);
};
var router = {
  'hello': handlers.hello
};

var server = http.createServer(function(req,res){
  var parsedUrl = url.parse(req.url, true);
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,'');
  var method = req.method.toLowerCase();
  var queryStringObject = parsedUrl.query;
  var headers = req.headers;
  var buffer = '';
  req.on('data', function(data){
    buffer += decoder.write(data);
  });
  req.on('end', function(){
    buffer += decoder.end();
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };
    chosenHandler(data, function(statusCode, payload){
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      payload = typeof(payload) == 'object' ? payload : {};
      var payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
});

server.listen(3000, function(){
  console.log('server is listening on port 3000 now');
});

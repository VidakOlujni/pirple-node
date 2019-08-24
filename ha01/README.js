

var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// created decoder to use later on
var decoder = new StringDecoder('utf-8');

// Define hendlers
var handlers = {};

// hello handler
handlers.hello = function(data, callback){
  // callback http status code and payload object
  callback(406, {'name': 'hello world handler', 'data': data});
  //callback(406, {'name': 'hello handler'});
};
// not found handler
handlers.notFound = function(data, callback){
  callback(404);
};

// Define request router
var router = {
  'hello': handlers.hello
};

// The server shouild respond to all requests with a string
var server = http.createServer(function(req,res){
  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true); // param true says that it should use query module
  // Get the pathname
  var path = parsedUrl.pathname;
  var trimmedPath = path.replace(/^\/+|\/+$/g,''); //powerfull magical regular expression
  // Get the HTTP Method
  var method = req.method.toLowerCase();
  // Get the query strin as an object
  var queryStringObject = parsedUrl.query;
  // Get the headers as an object
  var headers = req.headers;
  // Get the payload if there is any
  // created buffer to store data in it
  var buffer = '';
  req.on('data', function(data){
    // as request streams in payload is going to be appended to buffer
    buffer += decoder.write(data);
  });
  //on each request,  we append the result on to the buffer that we created once
  req.on('end', function(){
    buffer += decoder.end();

    //choose the handler this request should go to. If one is not found use notFound handler
    var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

    // Construct data object to send to handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    };

    // Route the request to handler specified in router
    chosenHandler(data, function(statusCode, payload){
      // use status code called back by the handler, or by default to 200
      statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
      // use the payload called back by the handler, or default to empty object
      payload = typeof(payload) == 'object' ? payload : {};
      // Convert the payload to a string
      var payloadString = JSON.stringify(payload);
      // Return response
      res.setHeader('Content-Type', 'application/json');
      // this one just told browsers that we are returning json and this is how it should be parsed
      res.writeHead(statusCode);
      res.end(payloadString);
      console.log('Returning this response: ', statusCode, payloadString);
    });
  });
});


// // Start the server and have it listen on port 3000
server.listen(3000, function(){
  console.log('server is listening on port 3000 now');
});

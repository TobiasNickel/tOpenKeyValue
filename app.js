var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//http://enable-cors.org/server_expressjs.html
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.get('/', function(req, res){
    res.render('index', { title: 'tOpenKeyValue' });
});

var nameSpaceKeys = {};//key is namespace, value is key
var nameSpaceStorrage = {};
var storrage={}


//get value
app.get('/:name',function(req, res){
	res.end(storrage[req.params.name]);
});
//set value
app.post('/:name',function(req, res){
    if(req.body.value){
		storrage[req.params.name] = req.body.value;
		hasChanged = true;
		res.json(req.params);
	}else res.json(false);
});
//set namespaced Value
app.post('/:namespace/:name',function(req, res){
    req.body.key = req.body.key?req.body.key:" ";
    if(req.body.value){
		if(!nameSpaceKeys[req.params.namespace]){
			nameSpaceKeys[req.params.namespace]=req.body.key;
			nameSpaceStorrage[req.params.namespace]={}
			hasChanged = true;
		}
		console.log(req.params)
		if(nameSpaceKeys[req.params.namespace] == req.body.key){
			nameSpaceStorrage[req.params.namespace][req.params.name] = req.body.value;
			hasChanged = true;
			res.end(nameSpaceStorrage[req.params.namespace][req.params.name]);
		}else{
			res.end();
		}
	}else res.json(false);
});

//get namespaced value
app.get('/:namespace/:name',function(req, res){
	if(!nameSpaceKeys[req.params.namespace]){
		nameSpaceKeys[req.params.namespace]=req.params.key;
		nameSpaceStorrage[req.params.namespace]={}
	}
    res.end(nameSpaceStorrage[req.params.namespace][req.params.name]);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



var nameSpaceKeys={};//key is namespace, value is key
var nameSpaceStorrage={};
var storrage={}
var hasChanged=false;
//Save to hardDrive process
var fs = require('fs');
setInterval(function(){
	if(hasChanged){
		fs.writeFile('./storrage.json',JSON.stringify({
			storrage:storrage,
			nameSpaceStrorrage:nameSpaceStorrage,
			nameSpaceKeys:nameSpaceKeys
		}, undefined, '    '));
		hasChanged=false;
	}
}, 10000);
var content = fs.readFileSync('./storrage.json') + '';
try{
	content=JSON.parse(content);
	storrage = content.storrage||{};
	nameSpaceKeys = content.nameSpaceKeys||{};
	nameSpaceStorrage = content.nameSpaceStorrage||{};
}catch(e){}
delete content;




var debug = require('debug')('keyValue:server');
var http = require('http');
app.set('port', "2222");
var server = http.createServer(app);
server.listen('2222');
server.on('listening', onListening);

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

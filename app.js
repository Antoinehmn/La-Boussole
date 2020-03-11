var
  express = require('express'),
  url = require('url'),
  fs = require('fs'),
  path = require('path'),
  app = express(),
  quizzer = require('node-quizzer'),
  _ = require('underscore-node'),
  getQuiz = function(method, req) {
    var urlParts = url.parse(req.url, true),
      query = urlParts.query,

      // générer un Quiz Random
      quiz = quizzer[method]({
        uname: query.fullname,
        uemail: query.email,
        name: query.quiz,
        count: parseInt(query.count),
        time: parseInt(query.time),
        perc: parseInt(query.perc)
      });

    return quiz;
  };


app.get('/', function(req, res) {
  var list = quizzer.getCategories();
  console.log(list);

  // Charger l'index.html template
  fs.readFile(__dirname + '/public/index.html', function(err, data) {
    if(err) throw err;

    // le remplir avec les questions types du module "Node-quizzer
    var compiled = _.template(data.toString());
    res.send(compiled({ availableQuizzes: list }));
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/quiz', function(req, res) {
  var quiz = getQuiz('generate', req);

  // Charger le quiz.html template
  fs.readFile(__dirname + '/quiz.html', function(err, data) {
    if(err) throw err;

    // le remplir avec les questions types du module "Node-quizzer
    var compiled = _.template(data.toString());
    res.send(compiled({ quiz: quiz }));
  });
});

app.get('/tokenize', function(req, res) {
  var quiz = getQuiz('tokenize', req),
    tokenUrl = req.protocol + '://' + req.get('host') + "/quiz/" + quiz.quid;

  res.set('Content-Type', 'text/plain');
  res.send(tokenUrl);
});

app.get('/quiz/:id', function(req, res) {
  var quiz = quizzer.fromToken(req.params.id);

  // Charger le quiz.html template
  if(quiz) {
    fs.readFile(__dirname + '/public/quiz.html', function(err, data) {
      if(err) throw err;

      // le remplir avec les questions types du module "Node-quizzer
      var compiled = _.template(data.toString());
      res.send(compiled({ quiz: quiz }));
    });
  } else {
    res.send("This token has expired!");
  }
})

app.get('/review', function(req, res) {
  var urlParts = url.parse(req.url, true),
    query = urlParts.query,
    results = quizzer.evaluate(query);

  // Charger le review.html template
  fs.readFile(__dirname + '/public/review.html', function(err, data) {
    if(err) throw err;

    // le remplir avec les questions types du module "Node-quizzer
    var compiled = _.template(data.toString());
    res.send(compiled({ results: results }));
  });
});

app.listen(3000);
console.log('Listening on port 3000');
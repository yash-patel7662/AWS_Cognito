const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const AmazoCognitoIdentity = require('amazon-cognito-identity-js')
global.fetch = require('node-fetch')
const expressSession = require('express-session')
const expressValidator = require('express-validator')
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

const config = require('./config.json')
const { globalAgent } = require('http')

const poolData = {
  UserPoolId: config.userPoolId,
  ClientId: config.clientId
}

const userPool = new AmazoCognitoIdentity.CognitoUserPool(poolData);


app.get('/signup', (req, res) => {
  res.writeHead(200, { "Content-type": "text/html" });
  fs.createReadStream("./index.html", "UTF-8").pipe(res);
})

app.post('/signup', (req, res) => {
  //const { email, password, confirmpassword } = req.body;
  const email = req.body.email
  const password = req.body.password
  const confirmpassword = req.body.confirm_password
  console.log(email, password, confirmpassword)

  if (password != confirmpassword) {
    res.send("Password not matched")
  }

  const emailData = {
    Name: 'email',
    Value: email
  };

  const emailAttribute = new AmazoCognitoIdentity.CognitoUserAttribute(emailData);

  userPool.signUp(email, password, [emailAttribute], null, (err, data) => {
    if (err) {
      return console.log(err)
    }
    res.send(data.user)
  })
});

app.get('/login', (req, res) => {
  res.writeHead(200, { "Content-type": "text/html" });
  fs.createReadStream("./login.html", "UTF-8").pipe(res);
})

app.post('/login', (req, res) => {
  const loginDetails = {
    Username: req.body.email,
    Password: req.body.password
  }

  const authenticationDetails = new AmazoCognitoIdentity.AuthenticationDetails(loginDetails)

  const userDetails = {
    Username: req.body.email,
    Pool: userPool
  }
  const cognitoUser = new AmazoCognitoIdentity.CognitoUser(userDetails)

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: data => {
      console.log(data)
      res.writeHead(200, { "Content-type": "text/html" });
      fs.createReadStream("./dashboard.html", "UTF-8").pipe(res);
    },
    onFailure: err => {
      res.send(err)
    }
  })
})

app.listen(8080)
console.log("Server start with 8080 port")
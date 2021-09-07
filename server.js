const express = require('express');
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const dotenv = require('dotenv');
const { fork } = require('child_process');
const nodemailer = require('nodemailer');
dotenv.config();

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'abelardo.wisoky43@ethereal.email',
      pass: 'hNPCvqvsVcPKFeQ9Fb'
  }
});
const transporterGmail = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
  }
});

const mailOptionsGmail = {
  from: 'Servidor Node.js',
  to: 'facunca33@gmail.com',
  subject: '',
  html: '',
}
const mailOptions = {
  from: 'Servidor Node.js',
  to: 'facunca33@gmail.com',
  subject: '',
  text: ''
}

const FACEBOOK_CLIENT_ID = process.argv[3] || '542559090213831'
const FACEBOOK_CLIENT_SECRET = process.argv[4] || '3f1cfb58db463bf5e0994f445cd8b0dd'
//const instacncia = new productos();
// creo una app de tipo express
const app = express();
const handlebars = require("express-handlebars")
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// inicializamos passport
app.use(passport.initialize());
app.use(passport.session());

app.engine('hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials/'
}));
app.set('view engine', 'hbs');
app.set('views', './views');
app.use(express.static('public'));
let userProfile
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false
}));

// configuramos passport para usar facebook
passport.use(new FacebookStrategy({
  clientID: FACEBOOK_CLIENT_ID,
  clientSecret: FACEBOOK_CLIENT_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'emails'],
  scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
  userProfile = profile;
  return done(null, userProfile);
}));

// inicializamos passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.send('Bienvenido al ejemplo de passport con facebook');
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback', passport.authenticate('facebook',
  {
      successRedirect: '/datos',
      failureRedirect: '/faillogin'
  }
));

app.get('/faillogin', (req, res) => {
  res.status(401).send({ error: 'no se pudo autenticar con facebook' })
});

app.get('/datos', (req, res) => {
  if (req.isAuthenticated()) {
    mailOptions.subject = "Log in"
    mailOptions.text = `Nombre ${userProfile._json.name} hora de logeo ${new Date()}`
    mailOptionsGmail.subject = "Log in"
    mailOptionsGmail.text = `Nombre ${userProfile._json.name} hora de logeo ${new Date()}  foto de perfil ${userProfile._json.picture.data.url}`
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
          console.log(err)
          return err
      }
      console.log(info)
  });
  transporterGmail.sendMail(mailOptionsGmail, (err, info) => {
    if (err) {
        console.log(err)
        return err
    }
    console.log(info)
});
client.messages.create({
  body: 'Hola soy un SMS desde Node.js!',
  from: '+17048692404',
  to: '+543518002741'
})
.then(message => console.log(message.sid))
.catch(console.log)

      res.render('list', { nombre: userProfile._json.name, email: userProfile._json.email, foto: userProfile._json.picture.data.url});
  } else {
      res.status(401).send('debe autenticarse primero');
  }
});
app.get('/info', (req, res) => {
    let resp= {}
    resp ={
      'version de node ' : process.version,
      'sistema operativo': process.platform,
      'uso de la memoria': process.memoryUsage(),
      'id del proceso': process.pid,
      'path de ejecucion': process.execPath,
      'arumentos de entrada': process.argv,
      'carpeta corriente': process.cwd()

    }
    res.send(resp)

});
app.get('/randoms', (req, res) => {
  const computo = fork('./serverHijo.js');
  computo.send(req.query.cant || 10000000);
  computo.on('message', sum => {
    res.end(`El array de numeros es  ${JSON.stringify(sum)}`);
});
});
app.get('/logout', (req, res) => {
  mailOptions.subject = "Log out"
  mailOptions.text = `Nombre ${userProfile._json.name} hora de log out ${new Date()}`
  mailOptionsGmail.subject = "Log out"
  mailOptionsGmail.text = `Nombre ${userProfile._json.name} hora de log ${new Date()} foto de perfil ${userProfile._json.picture.data.url}`
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
        console.log(err)
        return err
    }
    console.log(info)
});
transporterGmail.sendMail(mailOptionsGmail, (err, info) => {
  if (err) {
      console.log(err)
      return err
  }
  console.log(info)
});
  req.logout();
  res.send({logout: 'ok'})
});

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Servidor express escuchando en http://localhost:${PORT}`)
});

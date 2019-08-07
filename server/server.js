const express = require("express");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const { User, Document } = require("./models");
const crypto = require("crypto");
const cors = require("cors");

//routes
const dbAuth = require('./routes/auth.js');
const dbIndex = require('./routes/index.js');

const app = express();

//MongoDB
if (!process.env.MONGODB_URI) {
	throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
}
mongoose.connection.on('connected', function() {
	console.log('Success: connected to MongoDb!');
});

mongoose.connection.on('error', function(error) {
	console.log('Error connecting to MongoDb.', error);
	process.exit(1);
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
	session({
		secret: process.env.SECRET || 'h0nk',
		store: new MongoStore({ mongooseConnection: mongoose.connection }),
		resave: false,
		saveUninitialized: true
	})
);

//Passport
passport.serializeUser(function(user, done) {
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

function hash(password) {
	var hash = crypto.createHash('sha256');
	console.log(password);
	hash.update(password);
	return hash.digest('hex');
}

passport.use(
	new LocalStrategy(function(username, password, done) {
		// Find the user with the given username
		User.findOne({ username: username }, function(err, user) {
			// if there's an error, finish trying to authenticate (auth failed)
			if (err) {
				console.log(err);
				return done(err);
			}
			// if no user present, auth failed
			if (!user) {
				console.log(user);
				return done(null, false);
			}
			// if passwords do not match, auth failed
			if (user.password !== hash(password)) {
				return done(null, false);
			}
			// auth has has succeeded
			return done(null, user);
		});
	})
);

// app
app.use(passport.initialize());
app.use(passport.session());
app.use(cors);
app.use("/", dbAuth(passport, hash));
app.use("/", dbIndex());

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.listen(8080, () => {
	console.log('Server for Fancy-Doc listening on port 8080!');
});

module.exports = app;

const express = require('express');
const router = express.Router();
const { User } = require('../models');

module.exports = function(passport, hash) {
	router.post('/register', (req, res) => {
		console.log('/register --');
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			password: hash(req.body.password)
		});
		console.log('newUser', newUser);
		newUser
			.save()
			.then(response => {
				res.json({ success: true, user: newUser });
			})
			.catch(error => {
				console.log('saveUser', error);
			});
	});

	router.post('/login', passport.authenticate('local'), function(req, res) {
		console.log('/login --');
		if (req.user) {
			res.json({ success: true, user: req.user });
		} else {
			res.json({ success: false });
		}
	});

	router.post('/logout', (req, res) => {
		console.log('/logout --');
		req.logout();
		if (!req.user) {
			res.json({ success: true });
		} else res.json({ success: true });
	});

	return router;
};

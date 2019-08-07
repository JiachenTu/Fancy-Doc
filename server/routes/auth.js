const express = require('express');
const router = express.Router();
const { User } = require('../models');

module.exports = function(passport, hash) {
	router.post('/register', (req, res) => {
		console.log('/register -- ', req.body);
		if (!req.body.password || !req.body.email || !req.body.username) {
			return res.json({
				success: false,
				error: 'username, password or title does not exist'
			});
		}
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			password: hash(req.body.password)
		});
		newUser
			.save()
			.then(response => {
				res.json({ success: true, user: newUser });
			})
			.catch(error => {
				console.log('saveUser', error);
			});
	});

	// router.post(
	// 	'/login',
	// 	passport.authenticate('local', {
	// 		successRedirect: '/login/success',
	// 		failureRedirect: '/login/failure',
	// 		failureFlash: true
	// 	})
	// );

	router.post('/login', passport.authenticate('local'), function(req, res) {
		console.log('/login --', req.user);
		if (req.user) {
			return res.json({ success: true, user: req.user });
		} else {
			return res.json({ success: false });
		}
	});

	// router.get('/login/failure', function(req, res) {
	// 	res.status(401).json({
	// 		success: false,
	// 		error: 'refused'
	// 	});
	// });

	// router.get('/login/success', function(req, res) {
	// 	res.json({
	// 		success: true,
	// 		user: req.user
	// 	});
	// });

	router.post('/logout', (req, res) => {
		req.logout();
		if (!req.user) {
			return res.json({ success: true });
		} else res.json({ success: true });
	});

	return router;
};

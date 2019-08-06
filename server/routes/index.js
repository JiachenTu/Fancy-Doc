const express = require('express');
const router = express.Router();
const { User, Document } = require('../models');

module.exports = function() {
	router.post('/portal', (req, res) => {
		if (!req.body._id) {
			res.json({ success: false, error: '_id does not exist' });
		}
		User.findById(req.body._id)
			.populate('owned')
			.populate('collaborated')
			.exec((err, user) => {
				if (err) res.json({ success: false, error: err });
				if (!user) res.json({ success: false, error: 'Cannot find User' });
				const doc = { owned: user.owned, collaborated: user.collaborated };
				// console.log('/portal -- return doc', doc);
				res.json({ success: true, data: doc });
			});
	});

	// create a new document when user click button for "create new document"
	router.post('/document/new', (req, res) => {
		console.log('/document/new', req.body);
		//accept document without password
		if (!req.body.owner || !req.body.title) {
			res.json({
				success: false,
				error: 'owner or title does not exist'
			});
		}
		const newDoc = new Document({
			owner: req.body.owner,
			title: req.body.title,
			password: req.body.password
		});
		newDoc.save((err, doc) => {
			if (err) res.json({ success: true, error: err });
			res.json({ success: true });
		});
	});

	// when user click the link for a document, we provide the document object from database
	router.post('/document/edit', (req, res) => {
		if (!req.body.title) {
			res.json({
				success: false,
				error: 'title does not exist'
			});
		}
		Document.findOne({ title: req.body.title }).exec((err, doc) => {
			if (err) res.json({ success: true, error: err });
			res.json({ success: true, data: doc });
		});
	});

	return router;
};

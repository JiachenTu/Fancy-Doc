const express = require('express');
const router = express.Router();
const { User, Document } = require('../models');
const onlyUnique = (value, index, self) => {
	return self.indexOf(value) === index;
};

module.exports = function() {
	router.post('/userportal', (req, res) => {
		if (!req.body.userId) {
			res.json({ success: false, error: 'userId does not exist' });
		}
		User.findById(req.body.userId)
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
		// console.log('/document/new', req.body);
		//accept document without password
		console.log('req.body here is ', req.body);
		if ( !req.body.title) {
			return res.json({
				success: false,
				error: 'title does not exist'
			});
		}
		const newDoc = new Document({
			owner: req.user._id,
			title: req.body.title,
			// password: req.user.password
		});
		newDoc.save((err, doc) => {
			if (err) return res.json({ success: false, error: err });

			User.findById(req.user._id).exec((err, user)=> {
				user.owned.push(doc._id);
				user.save((err, user)=> {
					if (err) return res.json({success: false, error: err})

					res.json({ success: true });
				})
			})

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
			if (err) res.json({ success: false, error: err });
			res.json({ success: true, data: doc });
		});
	});

	//add collaborator: --> (email, documentId)
	router.post('/document/collaborate/add', (req, res) => {
		console.log('/document/password/add', req.body);
		if (!req.body.email || !req.body.documentId) {
			res.json({ success: false, error: 'email or documentId does not exist' });
		}
		Document.findOne({ _id: req.body.documentId }).exec((err, doc) => {
			if (err) res.json({ success: false, error: 'document finding failure' + err });
			User.findOne({ email: req.body.email }).exec((err, user) => {
				if (err) res.json({ success: false, error: 'user finding failure' + err });
				doc.collaborators = [...doc.collaborators, user._id];
				doc.collaborators = doc.collaborators.filter(onlyUnique);
				//update the document
				doc.save((err, savedDoc) => {
					if (err) res.json({ success: false, error: 'document saving failure' + err });
					console.log('savedDoc', savedDoc);
					//update the user
					user.collaborated = [...user.collaborated, savedDoc._id];
					user.collaborated = user.collaborated.filter(onlyUnique);
					user.save((err, savedUser) => {
						if (err) res.json({ success: false, error: err });
						console.log('savedUser', savedUser);
						res.json({ success: true });
					});
				});
			});
		});
	});

	//add password -->(password, documentId)
	router.post('/document/password/add', (req, res) => {
		console.log('/document/password/add', req.body);
		if (!req.body.password || !req.body.documentId) {
			res.json({ success: false, error: 'password or documentId does not exist' });
		}
		Document.findOne({ _id: req.body.documentId }).exec((err, doc) => {
			if (err) res.json({ success: false, error: err });
			doc.password = req.body.password;
			doc.save((err, retDoc) => {
				if (err) res.json({ success: false, error: err });
				res.json({ success: true });
			});
		});
	});

	return router;
};

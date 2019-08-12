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

	// save the doc in the database (it should already exist
	// since we save it in the db when creating it) when the user clicks save
	router.post('/:document/save', async (req, res) => {
		console.log('reaching here');
		console.log('req.body here is ', req.body);
		// let docTitle = req.body.docTitle; // look at req.body
		let docId = req.body.docId;  // need to make sure this is correct
		let newContent = req.body.newContent;
		const existingDoc = await Document.findById(docId);
		//	what if for some reason this won't finish because it can't find?

		existingDoc.content = newContent
		const data = await existingDoc.save()

		return res.json({
			success: true,
			data
		})
	});

	// when user clicks the link for a document, we provide the document object from database
	router.get('/document/:docId/get', (req, res) => {
		const docid = req.params.docId;
		if (!docid) {
			res.json({
				success: false,
				error: 'should pass in the id of the document'
			});
		}
		Document.findById(docid).exec((err, doc) => {
			if (err) res.json({ success: false, error: err });
			console.log("got content from doc", doc.content)
			res.json({ success: true, data: doc.content });
		});
	});
  // when user click the link for a document, we provide the document object from database
  // save the doc in the database (it should already exist
  // since we save it in the db when creating it) when the user clicks save
  router.post("/document/:docId/save", (req, res) => {
    const docid = req.params.docId;
    console.log('req.body here is ', docid, req.body);


    Document.findById(docid).exec((err, doc) => {
		if (err) return res.json({ success: false, error: err });
		const content = typeof req.body.content === "string" ?
			JSON.parse(req.body.content) :
			req.body.content;
		doc.content = req.body.content;
		//doc.content -- to be parsed: convertFromRaw(JSON.parse(doc.content).contentState)
		// console.log("newDoc", doc);
      doc.save((err, retDoc) => {
		if (err) return res.json({ success: false, error: err });
		console.log("saving doc", retDoc.content)
        res.json({ success: true, data: retDoc.content });
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

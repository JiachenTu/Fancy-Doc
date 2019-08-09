const express = require("express");
const router = express.Router();
const { User, Document } = require("../models");
const onlyUnique = (value, index, self) => {
  return self.indexOf(value) === index;
};

module.exports = function() {
  router.post("/userportal", (req, res) => {
    if (!req.body.userId) {
      res.json({ success: false, error: "userId does not exist" });
    }
    User.findById(req.body.userId)
      .populate("owned")
      .populate("collaborated")
      .exec((err, user) => {
        if (err) res.json({ success: false, error: err });
        if (!user) res.json({ success: false, error: "Cannot find User" });
        const doc = { owned: user.owned, collaborated: user.collaborated };
        // console.log('/portal -- return doc', doc);
        res.json({ success: true, data: doc });
      });
  });

  // create a new document when user click button for "create new document"
  router.post("/document/new", (req, res) => {
    // console.log('/document/new', req.body);
    //accept document without password
    console.log("req.body here is ", req.body);
    if (!req.body.title) {
      return res.json({
        success: false,
        error: "title does not exist"
      });
    }
    const newDoc = new Document({
      owner: req.user._id,
      title: req.body.title
      // password: req.user.password
    });
    newDoc.save((err, doc) => {
      if (err) return res.json({ success: false, error: err });

      User.findById(req.user._id).exec((err, user) => {
        user.owned.push(doc._id);
        user.save((err, user) => {
          if (err) return res.json({ success: false, error: err });

          res.json({ success: true, _id: doc._id });
        });
      });
    });
  });

  // when user click the link for a document, we provide the document object from database
  router.post("/document/edit", (req, res) => {
    if (!req.body.title) {
      res.json({
        success: false,
        error: "title does not exist"
      });
    }
    Document.findOne({ title: req.body.title }).exec((err, doc) => {
      if (err) res.json({ success: false, error: err });
      res.json({ success: true, data: doc });
    });
  });

  // when user clicks the link for a document, we provide the document object from database
  router.get("/document/:docId/get", (req, res) => {
    const docid = req.params.docId;
    if (!docid) {
      res.json({
        success: false,
        error: "should pass in the id of the document"
      });
    }
    Document.findById(docid).exec((err, doc) => {
      if (err) res.json({ success: false, error: err });
      res.json({ success: true, data: doc.content });
    });
  });
  // when user click the link for a document, we provide the document object from database
  // save the doc in the database (it should already exist
  // since we save it in the db when creating it) when the user clicks save
  router.post("/document/:docId/save", (req, res) => {
    const docid = req.params.docId;
    // console.log('req.body here is ', req.body);

    Document.findById(docid).exec((err, doc) => {
      if (err) return res.json({ success: false, error: err });
      doc.content = req.body.content;
      doc.save((err, doc) => {
        if (err) return res.json({ success: false, error: err });
        res.json({ success: true, data: req.body.content });
      });
    });
  });

  // add collaborator in userportal
  router.post("/document/:docId/addCollab", (req, res) => {
    const docid = req.params.docId;
    Document.findById(docid).exec((err, doc) => {
      if (err)
        res.json({ success: false, error: "document finding failure" + err });
      User.findOne({ email: req.body.email }).exec((err, user) => {
        if (err)
          res.json({ success: false, error: "user finding failure" + err });
        doc.collaborators = [...doc.collaborators, user._id];
        doc.collaborators = doc.collaborators.filter(onlyUnique);
        //update the document
        doc.save((err, savedDoc) => {
          if (err)
            res.json({
              success: false,
              error: "document saving failure" + err
            });
          console.log("savedDoc", savedDoc);
          //update the user
          user.collaborated = [...user.collaborated, savedDoc._id];
          // we can only add one user in collaborated array
          user.collaborated = user.collaborated.filter(onlyUnique);
          user.save((err, savedUser) => {
            if (err) res.json({ success: false, error: err });
            console.log("savedUser", savedUser);
            res.json({ success: true });
          });
        });
      });
    });
  });

  // add password -->(password, documentId)
  router.post("/document/password/add", (req, res) => {
    console.log("/document/password/add", req.body);
    if (!req.body.password || !req.body.documentId) {
      res.json({
        success: false,
        error: "password or documentId does not exist"
      });
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

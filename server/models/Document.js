const mongoose = require('mongoose');
/* 
    DocumentSchema:
        owner
        collaborators(include owner)
        password
        content
*/
const documentSchema = new mongoose.Schema(
	{
		owner: {
			type: mongoose.Schema.ObjectId,
			ref: 'User'
		},
		collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
		//owned documents
		password: {
			type: String
		},
		title: {
			type: String,
			required: true
		},
		content: {
			type: String
		}
	},
	{
		toJSON: { virtuals: true }
	}
);
const Document = mongoose.model('Document', documentSchema);
module.exports = Document;

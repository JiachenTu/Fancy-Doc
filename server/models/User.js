const mongoose = require('mongoose');
// mongoose.connect(connect);
/* 
    UserSchema:
        username
        password
        owned docs
        collaborated docs(include owned docs)
*/
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		password: {
			type: String,
			required: true
		},
		//owned documents
		owned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
		//collaborated documents (include owned documents)
		collaborated: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }]
	},
	{
		toJSON: { virtuals: true }
	}
);
const User = mongoose.model('User', userSchema);

module.exports = User;

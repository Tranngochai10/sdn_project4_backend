// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt');
// const Schema = mongoose.Schema;

// const UserSchema = new Schema({
//     username: {
//         type: String,
//         default: ""
//     },
//     password: {
//         type: String,
//         required: true
//     },
//     admin: {
//         type: Boolean,
//         default: false
//     }
// });

// module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false
    }
});

// ❌ Bạn đang thiếu 2 phần này:

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
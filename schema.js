const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logo: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const assetSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    number_of_rooms: {
        type: Number,
        required: true
    },
    images: {
        type: Array,
        required: true
    },
    agency: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: false
    },
    token_exp_date: {
        type: Number,
        required: false
    }
});

const applicationSchema = new mongoose.Schema({
    asset: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

module.exports = {userSchema, assetSchema, agencySchema, applicationSchema}
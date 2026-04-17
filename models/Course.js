const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        uppercase: true
    },
    name: {
        type: String,
        required: true
    },
    departmentCode: {
        type: String,
        required: true,
        uppercase: true
    },
    semesterNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    credits: {
        type: Number,
        default: 3
    },
    description: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Course', CourseSchema);

const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    departmentCode: {
        type: String,
        required: true,
        uppercase: true
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }]
});

module.exports = mongoose.model('Semester', SemesterSchema);

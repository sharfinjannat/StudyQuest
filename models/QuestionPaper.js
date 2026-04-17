const mongoose = require('mongoose');

const QuestionPaperSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        required: true,
        enum: ['final', 'ct', 'lab', 'others']
    },
    files: [{
        filename: String,
        originalName: String,
        path: String,
        size: Number,
        mimeType: String
    }],
    status: {
        type: String,
        required: true,
        default: 'pending',
        enum: ['pending', 'approved', 'rejected']
    },
    uploadedBy: {
        type: String,
        required: true
    },
    departmentCode: {
        type: String,
        required: true,
        uppercase: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semesterNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('QuestionPaper', QuestionPaperSchema);

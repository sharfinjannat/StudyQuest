require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import Models
const Department = require('./models/Department');
const Semester = require('./models/Semester');
const Course = require('./models/Course');
const QuestionPaper = require('./models/QuestionPaper');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, PDF, DOC, DOCX, ZIP, RAR files are allowed.'));
        }
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// API Routes

// POST /api/departments - Create Department and Auto-Generate 8 Semesters
app.post('/api/departments', async (req, res) => {
    try {
        const { name, code, image } = req.body;

        // Check if department already exists
        const existingDept = await Department.findOne({ code });
        if (existingDept) {
            return res.status(400).json({ message: 'Department already exists' });
        }

        // Create new department
        const newDepartment = new Department({
            name,
            code,
            image,
            createdAt: new Date()
        });

        const savedDepartment = await newDepartment.save();

        // Auto-generate 8 semesters for this department
        const semesters = [];
        for (let i = 1; i <= 8; i++) {
            const semester = new Semester({
                number: i,
                departmentCode: code,
                departmentId: savedDepartment._id,
                courses: []
            });
            semesters.push(semester);
        }

        await Semester.insertMany(semesters);

        res.status(201).json({
            message: 'Department created with 8 semesters',
            department: savedDepartment,
            semestersCreated: 8
        });
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/admin/stats - Get Admin Dashboard Stats
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPapers = await QuestionPaper.countDocuments();
        const pendingPapers = await QuestionPaper.countDocuments({ status: 'pending' });
        const totalDepts = await Department.countDocuments();

        res.json({
            totalUsers,
            totalPapers,
            pendingPapers,
            totalDepts
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/papers/pending - Get All Pending Papers
app.get('/api/papers/pending', async (req, res) => {
    try {
        const pendingPapers = await QuestionPaper.find({ status: 'pending' })
            .sort({ createdAt: -1 });

        res.json(pendingPapers);
    } catch (error) {
        console.error('Error fetching pending papers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/papers/:id/approve - Approve a Paper
app.put('/api/papers/:id/approve', async (req, res) => {
    try {
        const paperId = req.params.id;

        const updatedPaper = await QuestionPaper.findByIdAndUpdate(
            paperId,
            { status: 'approved' },
            { new: true }
        );

        if (!updatedPaper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        res.json({
            message: 'Paper approved successfully',
            paper: updatedPaper
        });
    } catch (error) {
        console.error('Error approving paper:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/papers/:id - Delete a Paper
app.delete('/api/papers/:id', async (req, res) => {
    try {
        const paperId = req.params.id;

        const deletedPaper = await QuestionPaper.findByIdAndDelete(paperId);

        if (!deletedPaper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        res.json({
            message: 'Paper deleted successfully',
            paper: deletedPaper
        });
    } catch (error) {
        console.error('Error deleting paper:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Additional useful routes

// GET /api/departments - Get all departments
app.get('/api/departments', async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/semesters/:departmentCode - Get semesters for a department
app.get('/api/semesters/:departmentCode', async (req, res) => {
    try {
        const { departmentCode } = req.params;
        const semesters = await Semester.find({ departmentCode })
            .populate('departmentId')
            .sort({ number: 1 });
        res.json(semesters);
    } catch (error) {
        console.error('Error fetching semesters:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/departments/:id - Update a department
app.put('/api/departments/:id', async (req, res) => {
    try {
        const deptId = req.params.id;
        const { name, code, image } = req.body;

        // Validate required fields
        if (!name || !code) {
            return res.status(400).json({ message: 'Name and code are required' });
        }

        // Check if another department with this code exists
        const existingDept = await Department.findOne({ 
            code: code.toUpperCase(), 
            _id: { $ne: deptId } 
        });
        
        if (existingDept) {
            return res.status(400).json({ message: 'Department with this code already exists' });
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            deptId,
            {
                name,
                code: code.toUpperCase(),
                image: image || `https://picsum.photos/seed/${code}/400/300.jpg`
            },
            { new: true }
        );

        if (!updatedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }

        res.json({
            message: 'Department updated successfully',
            department: updatedDepartment
        });
    } catch (error) {
        console.error('Error updating department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/departments/:id - Delete a department and its semesters
app.delete('/api/departments/:id', async (req, res) => {
    try {
        const deptId = req.params.id;
        
        // First delete all semesters for this department
        await Semester.deleteMany({ departmentId: deptId });
        
        // Then delete all courses for this department
        await Course.deleteMany({ departmentCode: (await Department.findById(deptId)).code });
        
        // Finally delete the department
        const deletedDepartment = await Department.findByIdAndDelete(deptId);
        
        if (!deletedDepartment) {
            return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({
            message: 'Department and associated data deleted successfully',
            department: deletedDepartment
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/courses - Create a new course
app.post('/api/courses', async (req, res) => {
    try {
        const { name, code, departmentCode, semesterNumber } = req.body;

        // Validate required fields
        if (!name || !code || !departmentCode || !semesterNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if course with this code already exists
        const existingCourse = await Course.findOne({ code: code.toUpperCase() });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }

        const newCourse = new Course({
            name,
            code: code.toUpperCase(),
            departmentCode: departmentCode.toUpperCase(),
            semesterNumber: parseInt(semesterNumber)
        });

        const savedCourse = await newCourse.save();
        res.status(201).json({
            message: 'Course created successfully',
            course: savedCourse
        });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// PUT /api/courses/:id - Update a course
app.put('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;
        const { name, code, departmentCode, semesterNumber } = req.body;

        // Validate required fields
        if (!name || !code || !departmentCode || !semesterNumber) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if another course with this code exists
        const existingCourse = await Course.findOne({ 
            code: code.toUpperCase(), 
            _id: { $ne: courseId } 
        });
        
        if (existingCourse) {
            return res.status(400).json({ message: 'Course with this code already exists' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            {
                name,
                code: code.toUpperCase(),
                departmentCode: departmentCode.toUpperCase(),
                semesterNumber: parseInt(semesterNumber)
            },
            { new: true }
        );

        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({
            message: 'Course updated successfully',
            course: updatedCourse
        });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/courses/:id - Delete a course
app.delete('/api/courses/:id', async (req, res) => {
    try {
        const courseId = req.params.id;

        const deletedCourse = await Course.findByIdAndDelete(courseId);

        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({
            message: 'Course deleted successfully',
            course: deletedCourse
        });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// GET /api/courses - Get all courses
app.get('/api/courses', async (req, res) => {
    console.log('GET /api/courses called');
    try {
        console.log('Attempting to fetch courses...');
        const courses = await Course.find().sort({ departmentCode: 1, semesterNumber: 1 });
        console.log('Courses found:', courses);
        console.log('First course:', courses[0]);
        res.json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// POST /api/papers/upload - Upload question papers with files
app.post('/api/papers/upload', upload.array('files', 10), async (req, res) => {
    try {
        const { title, departmentCode, courseId, semesterNumber, type, uploadedBy, description, status } = req.body;

        // Validate required fields
        if (!title || !departmentCode || !courseId || !semesterNumber || !type || !uploadedBy) {
            return res.status(400).json({ message: 'All required fields must be filled' });
        }

        // Check if files were uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one file must be uploaded' });
        }

        // Process uploaded files
        const files = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            path: file.path,
            size: file.size,
            mimeType: file.mimetype
        }));

        // Create new question paper
        const newPaper = new QuestionPaper({
            title,
            description: description || '',
            type,
            files,
            status: status || 'pending',
            uploadedBy,
            departmentCode,
            courseId,
            semesterNumber: parseInt(semesterNumber),
            uploadDate: new Date()
        });

        const savedPaper = await newPaper.save();

        res.status(201).json({
            message: 'Paper uploaded successfully',
            paper: savedPaper
        });
    } catch (error) {
        console.error('Error uploading paper:', error);
        res.status(500).json({ 
            message: 'Failed to upload paper', 
            error: error.message 
        });
    }
});

// GET /api/papers - Get all papers (for uploaded questions section)
app.get('/api/papers', async (req, res) => {
    try {
        const { courseId, type } = req.query;
        
        // Build query
        let query = {};
        if (courseId) query.courseId = courseId;
        if (type) query.type = type;
        
        const papers = await QuestionPaper.find(query)
            .populate('courseId', 'code name')
            .sort({ uploadDate: -1 });
        
        // Transform papers to ensure consistent format
        const transformedPapers = papers.map(paper => {
            const transformed = paper.toObject();
            
            // Handle old format papers with driveLink
            if (paper.driveLink && !paper.files) {
                transformed.files = [{
                    filename: paper.driveLink,
                    originalName: paper.title + '.pdf',
                    path: paper.driveLink,
                    size: 0,
                    mimeType: 'application/pdf'
                }];
                transformed.isLegacy = true;
            }
            
            return transformed;
        });
            
        res.json(transformedPapers);
    } catch (error) {
        console.error('Error fetching papers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// DELETE /api/papers/:id - Delete a Paper
app.delete('/api/papers/:id', async (req, res) => {
    try {
        const paperId = req.params.id;

        // Find the paper first to get file paths
        const paper = await QuestionPaper.findById(paperId);
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        // Delete associated files
        paper.files.forEach(file => {
            try {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            } catch (fileError) {
                console.error('Error deleting file:', fileError);
            }
        });

        // Delete the paper from database
        await QuestionPaper.findByIdAndDelete(paperId);

        res.json({ message: 'Paper deleted successfully' });
    } catch (error) {
        console.error('Error deleting paper:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

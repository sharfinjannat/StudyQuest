// API Configuration
// For GitHub Pages, you'll need to deploy your backend separately
// Update this URL to your deployed backend URL
const API_URL = 'https://your-backend-url.herokuapp.com/api'; // Change this to your backend URL

// For local development, uncomment the line below:
// const API_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let departments = [];
let pendingPapers = [];

// SPA Section Switching
function showSection(sectionName) {
    console.log('=== showSection called with:', sectionName);
    
    // Prevent default link behavior
    if (event) {
        event.preventDefault();
    }
    
    const studentView = document.getElementById('app-view-student');
    const adminView = document.getElementById('app-view-admin');
    
    console.log('studentView found:', !!studentView);
    console.log('adminView found:', !!adminView);
    
    // Hide all content sections first
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Handle different sections
    if (sectionName === 'student') {
        console.log('Switching to student view');
        if (adminView) adminView.classList.add('hidden');
        
        // Show main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Show student section
        const studentSection = document.getElementById('student-section');
        if (studentSection) {
            studentSection.classList.remove('hidden');
            studentSection.classList.add('active');
        }
    } else if (sectionName === 'admin') {
        console.log('Switching to admin view');
        if (studentView) studentView.classList.add('hidden');
        if (adminView) adminView.classList.remove('hidden');
        
        // Hide main content area when showing admin
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'none';
        }
        
        // Show dashboard immediately when admin opens
        console.log('Calling showAdminSection with dashboard');
        showAdminSection('dashboard');
    } else if (sectionName === 'upload') {
        console.log('Showing upload section');
        if (adminView) adminView.classList.add('hidden');
        
        // Show main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Show upload section
        const uploadSection = document.getElementById('upload-section');
        if (uploadSection) {
            uploadSection.classList.remove('hidden');
            uploadSection.classList.add('active');
        }
    } else if (sectionName === 'bookmarks') {
        console.log('Showing bookmarks section');
        if (adminView) adminView.classList.add('hidden');
        
        // Show main content area
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.display = 'block';
        }
        
        // Show bookmarks section
        const bookmarksSection = document.getElementById('bookmarks-section');
        if (bookmarksSection) {
            bookmarksSection.classList.remove('hidden');
            bookmarksSection.classList.add('active');
            
            // Load bookmarks when section is shown
            loadBookmarks();
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Semester Selection - Load courses for selected semester
async function selectSemester(semesterNumber) {
    console.log('Selected semester:', semesterNumber);
    
    // Get current department from the page
    const currentDeptElement = document.getElementById('current-department');
    const departmentCode = currentDeptElement ? currentDeptElement.textContent : '';
    
    if (!departmentCode) {
        showNotification('Please select a department first', 'error');
        return;
    }
    
    try {
        // Show loading state
        showNotification('Loading courses...', 'info');
        
        // Load courses for this department and semester
        const response = await fetch(`${API_URL}/courses`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        const allCourses = await response.json();
        const filteredCourses = allCourses.filter(course => 
            course.departmentCode === departmentCode && 
            course.semesterNumber === parseInt(semesterNumber)
        );
        
        console.log('Filtered courses for', departmentCode, 'semester', semesterNumber, ':', filteredCourses);
        
        showCoursesSection(filteredCourses, departmentCode, semesterNumber);
        
        if (filteredCourses.length === 0) {
            showNotification(`No courses found for ${departmentCode} Semester ${semesterNumber}`, 'info');
        } else {
            showNotification(`${filteredCourses.length} courses loaded`, 'success');
        }
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Failed to load courses', 'error');
    }
}

// Department Selection
function selectDepartment(departmentName) {
    console.log('Selected department:', departmentName);
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show semester section
    const semesterSection = document.getElementById('semester-section');
    if (semesterSection) {
        semesterSection.classList.remove('hidden');
        semesterSection.classList.add('active');
    }
    
    // Update department name in semester section
    const currentDeptElement = document.getElementById('current-department');
    const semesterTitleElement = document.getElementById('semester-title');
    
    if (currentDeptElement) {
        currentDeptElement.textContent = departmentName;
    }
    
    if (semesterTitleElement) {
        const deptFullNames = {
            'CSE': 'Computer Science & Engineering (CSE)',
            'ICT': 'Information & Communication Technology (ICT)',
            'DBA': 'Department of Business Administration (DBA)'
        };
        semesterTitleElement.textContent = deptFullNames[departmentName] || departmentName;
    }
    
    showNotification(`${departmentName} department selected!`, 'success');
}

function showCoursesSection(courses, departmentCode, semesterNumber) {
    console.log('Showing courses section with', courses.length, 'courses');
    
    // Hide semester section and show courses section
    const semesterSection = document.getElementById('semester-section');
    const coursesSection = document.getElementById('courses-section');
    
    if (semesterSection) {
        semesterSection.classList.add('hidden');
        semesterSection.classList.remove('active');
    }
    
    if (coursesSection) {
        coursesSection.classList.remove('hidden');
        coursesSection.classList.add('active');
        
        // Update section header
        const headerElement = coursesSection.querySelector('h2');
        if (headerElement) {
            headerElement.textContent = `Semester ${semesterNumber} Courses - ${departmentCode}`;
        }
        
        // Clear existing content and render courses
        coursesSection.innerHTML = `
            <div class="section-header">
                <h2>Semester ${semesterNumber} Courses - ${departmentCode}</h2>
                <p>Available courses for this semester</p>
                <button class="btn-secondary" onclick="goToDepartments()">
                    <i class="fas fa-arrow-left"></i> Back to Departments
                </button>
            </div>
        `;
        
        // Create courses container
        const coursesContainer = document.createElement('div');
        coursesContainer.className = 'courses-container';
        coursesSection.appendChild(coursesContainer);
        
        // Render courses
        renderCoursesList(courses);
    }
}

function renderCoursesList(courses) {
    // Find or create courses container
    let coursesContainer = document.querySelector('.courses-container');
    if (!coursesContainer) {
        coursesContainer = document.createElement('div');
        coursesContainer.className = 'courses-container';
        
        const coursesSection = document.getElementById('courses-section');
        if (coursesSection) {
            coursesSection.appendChild(coursesContainer);
        }
    }
    
    coursesContainer.innerHTML = '';
    
    if (courses.length === 0) {
        coursesContainer.innerHTML = `
            <div class="content-placeholder">
                <i class="fas fa-book fa-3x"></i>
                <h3>No Courses Available</h3>
                <p>No courses found for this semester. Contact admin to add courses.</p>
            </div>
        `;
        return;
    }
    
    const coursesGrid = document.createElement('div');
    coursesGrid.className = 'courses-grid';
    
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.className = 'course-card glass-card';
        
        courseCard.innerHTML = `
            <div class="course-header">
                <h3>${course.code}</h3>
                <span class="course-semester">Semester ${course.semesterNumber}</span>
            </div>
            <div class="course-body">
                <h4>${course.name}</h4>
                <p>${course.departmentCode} Department</p>
            </div>
            <div class="course-footer">
                <button class="btn-primary" onclick="viewCourseDetails('${course._id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
        
        coursesGrid.appendChild(courseCard);
    });
    
    coursesContainer.appendChild(coursesGrid);
}

function goToDepartments() {
    // Hide courses section
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
        coursesSection.classList.add('hidden');
        coursesSection.classList.remove('active');
    }
    
    // Show departments section
    const departmentsSection = document.getElementById('departments-section');
    if (departmentsSection) {
        departmentsSection.classList.remove('hidden');
        departmentsSection.classList.add('active');
    }
    
    showNotification('Back to departments', 'info');
}

function goToCourses() {
    // Hide course details section
    const courseDetailsSection = document.getElementById('course-details-section');
    if (courseDetailsSection) {
        courseDetailsSection.classList.add('hidden');
        courseDetailsSection.classList.remove('active');
    }
    
    // Show courses section
    const coursesSection = document.getElementById('courses-section');
    if (coursesSection) {
        coursesSection.classList.remove('hidden');
        coursesSection.classList.add('active');
    }
    
    showNotification('Back to courses', 'info');
}

let currentCourseId = null;
let currentPaperType = 'final';

function selectPaperType(paperType, buttonElement) {
    // Update active button
    document.querySelectorAll('.paper-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    buttonElement.classList.add('active');
    
    // Update current paper type
    currentPaperType = paperType;
    
    // Update section title
    const titles = {
        'final': 'Final Papers',
        'ct': 'CT Papers',
        'lab': 'Lab Final Papers',
        'others': 'Other Papers'
    };
    document.getElementById('papers-section-title').textContent = titles[paperType];
    
    // Reload papers for this type
    if (currentCourseId) {
        loadQuestionPapers(currentCourseId);
    }
}

function viewCourseDetails(courseId) {
    // Find course data
    fetch(`${API_URL}/courses`)
        .then(response => response.json())
        .then(courses => {
            const course = courses.find(c => c._id === courseId);
            if (!course) {
                showNotification('Course not found', 'error');
                return;
            }
            
            // Hide courses section
            const coursesSection = document.getElementById('courses-section');
            if (coursesSection) {
                coursesSection.classList.add('hidden');
                coursesSection.classList.remove('active');
            }
            
            // Show course details section
            const courseDetailsSection = document.getElementById('course-details-section');
            if (courseDetailsSection) {
                courseDetailsSection.classList.remove('hidden');
                courseDetailsSection.classList.add('active');
                
                // Update course details
                document.getElementById('course-details-title').textContent = `${course.name} - ${course.code}`;
                document.getElementById('course-details-info').textContent = `Course information and available question papers for ${course.name}`;
                document.getElementById('detail-course-code').textContent = course.code;
                document.getElementById('detail-course-name').textContent = course.name;
                document.getElementById('detail-department').textContent = course.departmentCode;
                document.getElementById('detail-semester').textContent = `Semester ${course.semesterNumber}`;
                
                // Set current course and reset to final papers
                currentCourseId = courseId;
                currentPaperType = 'final';
                
                // Reset button states
                document.querySelectorAll('.paper-type-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                document.querySelector('.paper-type-btn').classList.add('active');
                document.getElementById('papers-section-title').textContent = 'Final Papers';
                
                // Load question papers for this course
                loadQuestionPapers(courseId);
            }
        })
        .catch(error => {
            console.error('Error fetching course details:', error);
            showNotification('Failed to load course details', 'error');
        });
}

async function loadQuestionPapers(courseId) {
    try {
        const response = await fetch(`${API_URL}/papers?courseId=${courseId}&type=${currentPaperType}`);
        if (!response.ok) throw new Error('Failed to fetch question papers');
        
        const papers = await response.json();
        const container = document.getElementById('question-papers-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (papers.length === 0) {
            container.innerHTML = `
                <div class="no-papers-message">
                    <i class="fas fa-file-alt fa-3x"></i>
                    <h3>No ${currentPaperType} papers available</h3>
                    <p>Be the first to upload a ${currentPaperType} paper for this course!</p>
                </div>
            `;
            return;
        }
        
        // Create grid container
        const papersGrid = document.createElement('div');
        papersGrid.className = 'papers-grid';
        
        papers.forEach(paper => {
            const paperCard = createPaperCard(paper);
            papersGrid.appendChild(paperCard);
        });
        
        container.appendChild(papersGrid);
        
    } catch (error) {
        console.error('Error loading question papers:', error);
        const container = document.getElementById('question-papers-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle fa-2x"></i>
                    <h3>Failed to load papers</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
}

function createPaperCard(paper) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    // Get file icon based on first file
    const fileIcon = getFileIcon(paper.files && paper.files[0] ? paper.files[0].mimeType : 'application/pdf');
    
    // Format date
    const uploadDate = new Date(paper.uploadDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Check if paper is bookmarked
    const isBookmarked = checkIfBookmarked(paper._id);
    
    card.innerHTML = `
        <div class="paper-card-header">
            <i class="fas ${fileIcon} paper-icon"></i>
            <h3 class="paper-title">${paper.title || 'Untitled Paper'}</h3>
        </div>
        <div class="paper-card-body">
            <div class="paper-info">
                <div class="info-item">
                    <i class="fas fa-user"></i>
                    <span>Uploaded by: ${paper.uploadedBy || 'Unknown'}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Date: ${uploadDate}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-tag"></i>
                    <span>Type: ${paper.type || 'Unknown'}</span>
                </div>
            </div>
        </div>
        <div class="paper-card-footer">
            <button class="btn-action btn-view" onclick="viewPaper('${paper._id}')" title="View Paper">
                <i class="fas fa-eye"></i>
                <span>View</span>
            </button>
            <button class="btn-action btn-download" onclick="downloadPaper('${paper._id}')" title="Download Paper">
                <i class="fas fa-download"></i>
                <span>Download</span>
            </button>
            <button class="btn-action btn-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                    onclick="toggleBookmark('${paper._id}')" 
                    title="${isBookmarked ? 'Remove Bookmark' : 'Add Bookmark'}">
                <i class="fas fa-bookmark"></i>
                <span>Bookmark</span>
            </button>
        </div>
    `;
    
    return card;
}

function createAdminPaperCard(paper, type) {
    const card = document.createElement('div');
    card.className = 'paper-card';
    
    // Get file icon based on first file
    const fileIcon = getFileIcon(paper.files && paper.files[0] ? paper.files[0].mimeType : 'application/pdf');
    
    // Format date
    const uploadDate = new Date(paper.uploadDate || paper.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Check if paper is bookmarked
    const isBookmarked = checkIfBookmarked(paper._id);
    
    // Different footer buttons based on type
    let footerButtons = '';
    if (type === 'pending') {
        footerButtons = `
            <button class="btn-action btn-view" onclick="viewPaper('${paper._id}')" title="View Paper">
                <i class="fas fa-eye"></i>
                <span>View</span>
            </button>
            <button class="btn-action btn-approve" onclick="approvePaper('${paper._id}')" title="Approve Paper">
                <i class="fas fa-check"></i>
                <span>Approve</span>
            </button>
            <button class="btn-action btn-reject" onclick="rejectPaper('${paper._id}')" title="Reject Paper">
                <i class="fas fa-times"></i>
                <span>Reject</span>
            </button>
            <button class="btn-action btn-delete" onclick="deletePaper('${paper._id}')" title="Delete Paper">
                <i class="fas fa-trash"></i>
                <span>Delete</span>
            </button>
        `;
    } else {
        footerButtons = `
            <button class="btn-action btn-view" onclick="viewPaper('${paper._id}')" title="View Paper">
                <i class="fas fa-eye"></i>
                <span>View</span>
            </button>
            <button class="btn-action btn-delete" onclick="deletePaper('${paper._id}')" title="Delete Paper">
                <i class="fas fa-trash"></i>
                <span>Delete</span>
            </button>
        `;
    }
    
    card.innerHTML = `
        <div class="paper-card-header">
            <i class="fas ${fileIcon} paper-icon"></i>
            <h3 class="paper-title">${paper.title || 'Untitled Paper'}</h3>
        </div>
        <div class="paper-card-body">
            <div class="paper-info">
                <div class="info-item">
                    <i class="fas fa-user"></i>
                    <span>Uploaded by: ${paper.uploadedBy || paper.uploaderName || 'Unknown'}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-calendar"></i>
                    <span>Date: ${uploadDate}</span>
                </div>
                <div class="info-item">
                    <i class="fas fa-tag"></i>
                    <span>Type: ${paper.type || 'Unknown'}</span>
                </div>
                ${paper.departmentCode ? `
                <div class="info-item">
                    <i class="fas fa-building"></i>
                    <span>Department: ${paper.departmentCode}</span>
                </div>
                ` : ''}
                ${paper.semesterNumber ? `
                <div class="info-item">
                    <i class="fas fa-graduation-cap"></i>
                    <span>Semester: ${paper.semesterNumber}</span>
                </div>
                ` : ''}
                ${paper.status ? `
                <div class="info-item">
                    <i class="fas fa-info-circle"></i>
                    <span>Status: <span class="status-badge ${paper.status}">${paper.status}</span></span>
                </div>
                ` : ''}
            </div>
        </div>
        <div class="paper-card-footer">
            ${footerButtons}
        </div>
    `;
    
    return card;
}

function getFileIcon(mimeType) {
    if (!mimeType) return 'fa-file-pdf';
    
    const iconMap = {
        'application/pdf': 'fa-file-pdf',
        'application/msword': 'fa-file-word',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'fa-file-word',
        'image/jpeg': 'fa-file-image',
        'image/png': 'fa-file-image',
        'image/jpg': 'fa-file-image',
        'application/zip': 'fa-file-archive',
        'application/x-rar-compressed': 'fa-file-archive',
        'application/x-zip-compressed': 'fa-file-archive'
    };
    
    return iconMap[mimeType] || 'fa-file-pdf';
}

function checkIfBookmarked(paperId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    return bookmarks.includes(paperId);
}

function toggleBookmark(paperId) {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const index = bookmarks.indexOf(paperId);
    
    if (index > -1) {
        // Remove bookmark
        bookmarks.splice(index, 1);
        showNotification('Bookmark removed', 'info');
    } else {
        // Add bookmark
        bookmarks.push(paperId);
        showNotification('Bookmark added', 'success');
    }
    
    // Save to localStorage
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    
    // Update button state
    const button = event.target.closest('.btn-bookmark');
    if (button) {
        button.classList.toggle('bookmarked');
        button.title = index > -1 ? 'Add Bookmark' : 'Remove Bookmark';
    }
    
    // Update bookmarks section if it's visible
    if (document.getElementById('bookmarks-section').classList.contains('active')) {
        loadBookmarks();
    }
}

async function loadBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    const container = document.getElementById('bookmarks-container');
    
    if (!container) return;
    
    container.innerHTML = '';
    
    if (bookmarks.length === 0) {
        container.innerHTML = `
            <div class="no-bookmarks-message">
                <i class="fas fa-bookmark fa-3x"></i>
                <h3>No Bookmarks Yet</h3>
                <p>Start bookmarking papers to see them here!</p>
            </div>
        `;
        return;
    }
    
    try {
        // Fetch all bookmarked papers
        const papers = await Promise.all(
            bookmarks.map(bookmarkId => 
                fetch(`${API_URL}/papers`)
                    .then(res => res.json())
                    .then(papers => papers.find(paper => paper._id === bookmarkId))
            )
        );
        
        // Filter out undefined papers (in case some were deleted)
        const validPapers = papers.filter(paper => paper !== undefined);
        
        if (validPapers.length === 0) {
            container.innerHTML = `
                <div class="no-bookmarks-message">
                    <i class="fas fa-bookmark fa-3x"></i>
                    <h3>No Valid Bookmarks</h3>
                    <p>Some bookmarked papers may have been removed</p>
                </div>
            `;
            return;
        }
        
        // Create grid container
        const bookmarksGrid = document.createElement('div');
        bookmarksGrid.className = 'papers-grid';
        
        validPapers.forEach(paper => {
            const paperCard = createPaperCard(paper);
            bookmarksGrid.appendChild(paperCard);
        });
        
        container.appendChild(bookmarksGrid);
        
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <h3>Failed to load bookmarks</h3>
                <p>Please try again later</p>
            </div>
        `;
    }
}

async function viewPaper(paperId) {
    try {
        const response = await fetch(`${API_URL}/papers`);
        const papers = await response.json();
        const paper = papers.find(p => p._id === paperId);
        
        if (!paper) {
            showNotification('Paper not found', 'error');
            return;
        }
        
        // Handle legacy papers with driveLink
        if (paper.isLegacy && paper.driveLink) {
            window.open(paper.driveLink, '_blank');
            return;
        }
        
        // Handle new format papers with files
        if (!paper.files || paper.files.length === 0) {
            showNotification('Paper file not found', 'error');
            return;
        }
        
        if (paper.files.length === 1) {
            // If only one file, use exact same logic as download but without download attribute
            const file = paper.files[0];
            const fileUrl = `https://your-backend-url.herokuapp.com/uploads/${file.filename}`;
            
            // Create link exactly like downloadFile but without download attribute
            const viewLink = document.createElement('a');
            viewLink.href = fileUrl;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener noreferrer';
            viewLink.style.display = 'none';
            
            document.body.appendChild(viewLink);
            viewLink.click();
            document.body.removeChild(viewLink);
            
            showNotification(`Opening ${file.originalName}...`, 'success');
        } else {
            // If multiple files, show file selection modal
            showFileSelectionModal(paper.files, 'view');
        }
        
    } catch (error) {
        console.error('Error viewing paper:', error);
        showNotification('Failed to view paper', 'error');
    }
}

async function downloadPaper(paperId) {
    try {
        const response = await fetch(`${API_URL}/papers`);
        const papers = await response.json();
        const paper = papers.find(p => p._id === paperId);
        
        if (!paper) {
            showNotification('Paper not found', 'error');
            return;
        }
        
        // Handle legacy papers with driveLink
        if (paper.isLegacy && paper.driveLink) {
            // For legacy papers, create a download link
            const downloadLink = document.createElement('a');
            downloadLink.href = paper.driveLink;
            downloadLink.download = paper.title + '.pdf';
            downloadLink.target = '_blank';
            downloadLink.click();
            showNotification('Opening paper...', 'info');
            return;
        }
        
        // Handle new format papers with files
        if (!paper.files || paper.files.length === 0) {
            showNotification('Paper file not found', 'error');
            return;
        }
        
        if (paper.files.length === 1) {
            // If only one file, download directly
            const file = paper.files[0];
            downloadFile(file);
        } else {
            // If multiple files, show file selection modal
            showFileSelectionModal(paper.files, 'download');
        }
        
    } catch (error) {
        console.error('Error downloading paper:', error);
        showNotification('Failed to download paper', 'error');
    }
}

async function downloadFile(file) {
    try {
        const fileUrl = `https://your-backend-url.herokuapp.com/uploads/${file.filename}`;
        
        // Fetch the file as blob
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }
        
        const blob = await response.blob();
        
        // Create blob URL and download link
        const blobUrl = window.URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = file.originalName;
        downloadLink.style.display = 'none';
        
        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            window.URL.revokeObjectURL(blobUrl);
        }, 100);
        
        showNotification(`Downloaded ${file.originalName}`, 'success');
        
    } catch (error) {
        console.error('Download error:', error);
        showNotification('Failed to download file', 'error');
    }
}

function showFileSelectionModal(files, action) {
    // Check if this is a legacy paper with driveLink
    if (files.length === 1 && files[0].filename && files[0].filename.startsWith('http')) {
        // Legacy paper - just open/download directly
        if (action === 'view') {
            window.open(files[0].filename, '_blank');
        } else {
            const downloadLink = document.createElement('a');
            downloadLink.href = files[0].filename;
            downloadLink.download = files[0].originalName;
            downloadLink.target = '_blank';
            downloadLink.click();
            showNotification(`Downloading ${files[0].originalName}`, 'success');
        }
        return;
    }
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    modalOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    // Create modal content
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText = `
        background: white;
        border-radius: 16px;
        padding: 32px;
        max-width: 500px;
        width: 90%;
        max-height: 70vh;
        overflow-y: auto;
        position: relative;
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #2c3e50;">Select File to ${action === 'view' ? 'View' : 'Download'}</h3>
        <div class="file-list-modal" style="display: flex; flex-direction: column; gap: 12px;">
            ${files.map((file, index) => `
                <div class="file-item-modal" style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onclick="handleFileSelection('${file.filename}', '${file.originalName}', '${action}')">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <i class="fas ${getFileIcon(file.mimeType)}" style="color: #667eea; font-size: 20px;"></i>
                        <div>
                            <div style="font-weight: 600; color: #2c3e50;">${file.originalName}</div>
                            <div style="font-size: 14px; color: #6c757d;">${formatFileSize(file.size)}</div>
                        </div>
                    </div>
                    <button class="btn-action ${action === 'view' ? 'btn-view' : 'btn-download'}" style="width: 40px; height: 40px;">
                        <i class="fas fa-${action === 'view' ? 'eye' : 'download'}"></i>
                    </button>
                </div>
            `).join('')}
        </div>
        <button onclick="closeFileSelectionModal()" style="
            margin-top: 20px;
            padding: 12px 24px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
        ">Cancel</button>
    `;
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Close modal when clicking overlay
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            closeFileSelectionModal();
        }
    });
}

function handleFileSelection(filename, originalName, action) {
    closeFileSelectionModal();
    
    if (action === 'view') {
        // Check if it's a URL (legacy paper)
        if (filename.startsWith('http')) {
            window.open(filename, '_blank');
        } else {
            // Use exact same logic as downloadFile but without download attribute
            const fileUrl = `https://your-backend-url.herokuapp.com/uploads/${filename}`;
            
            const viewLink = document.createElement('a');
            viewLink.href = fileUrl;
            viewLink.target = '_blank';
            viewLink.rel = 'noopener noreferrer';
            viewLink.style.display = 'none';
            
            document.body.appendChild(viewLink);
            viewLink.click();
            document.body.removeChild(viewLink);
            
            showNotification(`Opening ${originalName}...`, 'success');
        }
    } else {
        // Check if it's a URL (legacy paper)
        if (filename.startsWith('http')) {
            const downloadLink = document.createElement('a');
            downloadLink.href = filename;
            downloadLink.download = originalName;
            downloadLink.target = '_blank';
            downloadLink.click();
            showNotification(`Downloading ${originalName}`, 'success');
        } else {
            downloadFile({ filename, originalName });
        }
    }
}

function closeFileSelectionModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        modal.remove();
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Upload Functions
async function loadCoursesForUpload() {
    const departmentCode = document.getElementById('paper-department').value;
    const courseSelect = document.getElementById('paper-course');
    
    if (!departmentCode) {
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/courses?department=${departmentCode}`);
        if (!response.ok) throw new Error('Failed to fetch courses');
        
        const courses = await response.json();
        courseSelect.innerHTML = '<option value="">Select Course</option>';
        
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course._id;
            option.textContent = `${course.code} - ${course.name}`;
            courseSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Failed to load courses', 'error');
    }
}

async function uploadPaper() {
    const title = document.getElementById('paper-title').value;
    const department = document.getElementById('paper-department').value;
    const course = document.getElementById('paper-course').value;
    const semester = document.getElementById('paper-semester').value;
    const type = document.getElementById('paper-type').value;
    const uploader = document.getElementById('paper-uploader').value;
    const description = document.getElementById('paper-description').value;
    const fileInput = document.getElementById('fileInput');
    
    // Validate required fields
    if (!title || !department || !course || !semester || !type || !uploader) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (fileInput.files.length === 0) {
        showNotification('Please select at least one file to upload', 'error');
        return;
    }
    
    // Check file sizes (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    for (let file of fileInput.files) {
        if (file.size > maxSize) {
            showNotification(`File "${file.name}" exceeds 50MB limit`, 'error');
            return;
        }
    }
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('departmentCode', department);
        formData.append('courseId', course);
        formData.append('semesterNumber', semester);
        formData.append('type', type);
        formData.append('uploadedBy', uploader);
        formData.append('description', description);
        formData.append('status', 'pending'); // All uploads start as pending
        
        // Add files
        for (let file of fileInput.files) {
            formData.append('files', file);
        }
        
        const response = await fetch(`${API_URL}/papers/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to upload paper');
        
        const result = await response.json();
        showNotification('Paper uploaded successfully! It will be reviewed before being published.', 'success');
        
        // Reset form
        resetUploadForm();
        
    } catch (error) {
        console.error('Error uploading paper:', error);
        showNotification('Failed to upload paper', 'error');
    }
}

function resetUploadForm() {
    document.getElementById('paper-title').value = '';
    document.getElementById('paper-department').value = '';
    document.getElementById('paper-course').innerHTML = '<option value="">Select Course</option>';
    document.getElementById('paper-semester').value = '';
    document.getElementById('paper-type').value = '';
    document.getElementById('paper-uploader').value = '';
    document.getElementById('paper-description').value = '';
    document.getElementById('fileInput').value = '';
    
    // Hide file preview
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    if (filePreview) filePreview.style.display = 'none';
    if (fileList) fileList.innerHTML = '';
    
    showNotification('Form reset successfully', 'info');
}

// Enhanced file handling with drag and drop
document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const filePreview = document.getElementById('filePreview');
    const fileList = document.getElementById('fileList');
    
    if (!fileInput || !uploadArea || !filePreview || !fileList) return;
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Drag and drop handlers
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        handleFiles(files);
        
        // Update file input
        fileInput.files = files;
    });
    
    // Handle files function
    function handleFiles(files) {
        if (files.length === 0) {
            filePreview.style.display = 'none';
            fileList.innerHTML = '';
            return;
        }
        
        // Check file sizes
        const maxSize = 50 * 1024 * 1024; // 50MB
        const validFiles = [];
        
        for (let file of files) {
            if (file.size > maxSize) {
                showNotification(`File "${file.name}" exceeds 50MB limit`, 'error');
                continue;
            }
            validFiles.push(file);
        }
        
        if (validFiles.length === 0) {
            showNotification('No valid files selected', 'error');
            return;
        }
        
        // Show file preview
        filePreview.style.display = 'block';
        fileList.innerHTML = '';
        
        validFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            
            const fileIcon = getFileIcon(file.name);
            const fileSize = formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="file-item-info">
                    <i class="fas ${fileIcon} file-item-icon"></i>
                    <div>
                        <div class="file-item-name">${file.name}</div>
                        <div class="file-item-size">${fileSize}</div>
                    </div>
                </div>
                <button class="file-item-remove" onclick="removeFile(${index})">
                    <i class="fas fa-times"></i> Remove
                </button>
            `;
            
            fileList.appendChild(fileItem);
        });
        
        showNotification(`${validFiles.length} file(s) selected`, 'info');
    }
    
    // Remove file function
    window.removeFile = function(index) {
        const fileInput = document.getElementById('fileInput');
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        // Remove file at index
        files.splice(index, 1);
        
        // Add remaining files to DataTransfer
        files.forEach(file => dt.items.add(file));
        
        // Update file input
        fileInput.files = dt.files;
        
        // Re-handle files
        handleFiles(fileInput.files);
    };
    
    // Get file icon based on extension
    function getFileIcon(filename) {
        const ext = filename.split('.').pop().toLowerCase();
        const iconMap = {
            'pdf': 'fa-file-pdf',
            'doc': 'fa-file-word',
            'docx': 'fa-file-word',
            'jpg': 'fa-file-image',
            'jpeg': 'fa-file-image',
            'png': 'fa-file-image',
            'zip': 'fa-file-archive',
            'rar': 'fa-file-archive'
        };
        return iconMap[ext] || 'fa-file';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});

// Breadcrumb Navigation
function goToHome() {
    // Hide admin view
    const adminView = document.getElementById('app-view-admin');
    if (adminView) {
        adminView.classList.add('hidden');
    }
    
    // Show main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.display = 'block';
    }
    
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show student section
    const studentSection = document.getElementById('student-section');
    if (studentSection) {
        studentSection.classList.remove('hidden');
        studentSection.classList.add('active');
    }
}

function goToDepartments() {
    // Same as going home since departments are in the home section
    goToHome();
}

// Admin Section Navigation
function showAdminSection(sectionName) {
    console.log('Showing admin section:', sectionName);
    
    // Prevent default link behavior
    if (event) {
        event.preventDefault();
    }
    
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show the requested admin section
    const targetSection = document.getElementById(`admin-${sectionName}`);
    console.log('Target section found:', !!targetSection);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        console.log('Section activated:', sectionName);
    } else {
        console.log('Section not found, defaulting to dashboard');
        // Default to dashboard if section not found
        const dashboardSection = document.getElementById('admin-dashboard');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.classList.add('active');
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Show Notification
function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 2000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = '#80CBC4';
            break;
        case 'error':
            notification.style.background = '#F48FB1';
            break;
        default:
            notification.style.background = 'linear-gradient(to right, #9FA8DA, #7986CB)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// API Functions
async function loadDepartments() {
    try {
        // First test if API is accessible
        console.log('Testing API connection...');
        console.log('API_URL:', API_URL);
        
        const response = await fetch(`${API_URL}/departments`);
        console.log('Departments response status:', response.status);
        console.log('Departments response ok:', response.ok);
        
        if (!response.ok) {
            console.error('Departments API response not ok:', response.status, response.statusText);
            throw new Error(`Failed to fetch departments: ${response.status} ${response.statusText}`);
        }
        
        const departments = await response.json();
        console.log('Departments loaded:', departments);
        console.log('Departments count:', departments.length);
        
        // Test courses API separately
        console.log('Testing courses API...');
        const coursesResponse = await fetch(`${API_URL}/courses`);
        console.log('Courses response status:', coursesResponse.status);
        console.log('Courses response ok:', coursesResponse.ok);
        
        let allCourses = [];
        if (coursesResponse.ok) {
            allCourses = await coursesResponse.json();
            console.log('Courses loaded for counting:', allCourses);
            console.log('Courses count:', allCourses.length);
        } else {
            console.error('Courses API failed:', coursesResponse.status, coursesResponse.statusText);
            // Try to get courses from localStorage as fallback
            const storedCourses = localStorage.getItem('coursesData');
            if (storedCourses) {
                allCourses = JSON.parse(storedCourses);
                console.log('Using cached courses from localStorage:', allCourses);
            }
        }
        
        // Update admin departments table
        const departmentsTable = document.getElementById('departments-tbody');
        if (departmentsTable) {
            departmentsTable.innerHTML = '';
            
            if (departments.length === 0) {
                departmentsTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">No departments found</td></tr>';
                return;
            }
            
            departments.forEach(dept => {
                const courseCount = allCourses.filter(course => 
                    course.departmentCode === dept.code
                ).length;
                
                console.log(`Department ${dept.code} has ${courseCount} courses`);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${dept.code}</td>
                    <td>${dept.name}</td>
                    <td style="text-align: center;">${courseCount}</td>
                    <td>
                        <button class="btn-edit" onclick="editDepartment('${dept._id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-delete" onclick="deleteDepartment('${dept._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
                departmentsTable.appendChild(row);
            });
        }
        
        // Update home page departments grid
        renderDepartments(departments);
        
    } catch (error) {
        console.error('Error loading departments:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        showNotification('Failed to load departments: ' + error.message, 'error');
    }
}

function renderDepartments(departmentsData) {
    const departmentsGrid = document.querySelector('.departments-grid');
    const departmentsTable = document.getElementById('departments-tbody');
    
    // Update home page departments grid
    if (departmentsGrid) {
        departmentsGrid.innerHTML = '';
        
        if (departmentsData.length === 0) {
            departmentsGrid.innerHTML = '<p style="text-align: center; color: #666;">No departments available</p>';
            return;
        }
        
        departmentsData.forEach(dept => {
            const deptCard = document.createElement('div');
            deptCard.className = 'department-card glass-card';
            deptCard.onclick = () => selectDepartment(dept.code);
            
            deptCard.innerHTML = `
                <div class="dept-icon">
                    <i class="fas fa-${getDepartmentIcon(dept.code)}"></i>
                </div>
                <h3>${dept.code}</h3>
                <p>${dept.name}</p>
            `;
            
            departmentsGrid.appendChild(deptCard);
        });
    }
    
    // Update admin departments table
    if (departmentsTable) {
        departmentsTable.innerHTML = '';
        
        if (departmentsData.length === 0) {
            departmentsTable.innerHTML = '<tr><td colspan="4" style="text-align: center;">No departments found</td></tr>';
            return;
        }
        
        departmentsData.forEach(dept => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${dept.code}</td>
                <td>${dept.name}</td>
                <td style="text-align: center;">0</td>
                <td>
                    <button class="btn-edit" onclick="editDepartment('${dept._id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteDepartment('${dept._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            departmentsTable.appendChild(row);
        });
    }
}

function renderDefaultDepartments() {
    const departmentsGrid = document.querySelector('.departments-grid');
    if (!departmentsGrid) return;
    
    departmentsGrid.innerHTML = '<p style="text-align: center; color: #666;">No departments available. Please add departments through admin panel.</p>';
}

function getDepartmentIcon(code) {
    const icons = {
        'CSE': 'laptop-code',
        'ICT': 'network-wired',
        'DBA': 'briefcase',
        'EEE': 'bolt',
        'CE': 'building',
        'ME': 'cogs'
    };
    return icons[code] || 'graduation-cap';
}

function checkUserRole() {
    // For demo purposes, we'll simulate user role
    // In a real app, this would come from authentication
    currentUser = { role: 'student' }; // Change to 'admin' to test admin features
}

async function loadAdminStats() {
    try {
        const response = await fetch(`${API_URL}/admin/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const stats = await response.json();
        
        // Update dashboard cards
        document.getElementById('total-users').textContent = stats.totalUsers || 0;
        document.getElementById('total-papers').textContent = stats.totalPapers || 0;
        document.getElementById('pending-approvals').textContent = stats.pendingPapers || 0;
        document.getElementById('total-depts').textContent = stats.totalDepts || 0;
        
        console.log('Admin stats loaded:', stats);
    } catch (error) {
        console.error('Error loading admin stats:', error);
        showNotification('Failed to load admin statistics', 'error');
    }
}

async function loadPendingPapers() {
    try {
        const response = await fetch(`${API_URL}/papers/pending`);
        if (!response.ok) throw new Error('Failed to fetch pending papers');
        
        pendingPapers = await response.json();
        renderPendingPapers();
        console.log('Pending papers loaded:', pendingPapers);
    } catch (error) {
        console.error('Error loading pending papers:', error);
        showNotification('Failed to load pending papers', 'error');
    }
}

function renderPendingPapers() {
    const container = document.getElementById('pending-papers-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (pendingPapers.length === 0) {
        container.innerHTML = `
            <div class="no-papers-message">
                <i class="fas fa-file-alt fa-3x"></i>
                <h3>No Pending Papers</h3>
                <p>No papers waiting for approval</p>
            </div>
        `;
        return;
    }
    
    // Create grid container
    const papersGrid = document.createElement('div');
    papersGrid.className = 'papers-grid';
    
    pendingPapers.forEach(paper => {
        const paperCard = createAdminPaperCard(paper, 'pending');
        papersGrid.appendChild(paperCard);
    });
    
    container.appendChild(papersGrid);
}

async function approvePaper(paperId) {
    try {
        const response = await fetch(`${API_URL}/papers/${paperId}/approve`, {
            method: 'PUT'
        });
        
        if (!response.ok) throw new Error('Failed to approve paper');
        
        showNotification('Paper approved successfully', 'success');
        // Refresh pending papers list
        await loadPendingPapers();
        // Refresh admin stats
        await loadAdminStats();
    } catch (error) {
        console.error('Error approving paper:', error);
        showNotification('Failed to approve paper', 'error');
    }
}

async function deletePaper(paperId) {
    if (!confirm('Are you sure you want to delete this paper?')) return;
    
    try {
        const response = await fetch(`${API_URL}/papers/${paperId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete paper');
        
        showNotification('Paper deleted successfully', 'success');
        // Refresh pending papers list
        await loadPendingPapers();
        // Refresh admin stats
        await loadAdminStats();
    } catch (error) {
        console.error('Error deleting paper:', error);
        showNotification('Failed to delete paper', 'error');
    }
}

async function refreshPendingPapers() {
    showNotification('Refreshing pending papers...', 'info');
    await loadPendingPapers();
}

async function loadUploadedQuestions() {
    try {
        const response = await fetch(`${API_URL}/papers`);
        if (!response.ok) throw new Error('Failed to fetch uploaded questions');
        
        const uploadedQuestions = await response.json();
        renderUploadedQuestions(uploadedQuestions);
        console.log('Uploaded questions loaded:', uploadedQuestions);
    } catch (error) {
        console.error('Error loading uploaded questions:', error);
        showNotification('Failed to load uploaded questions', 'error');
    }
}

function renderUploadedQuestions(questions) {
    const container = document.getElementById('uploaded-questions-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (questions.length === 0) {
        container.innerHTML = `
            <div class="no-papers-message">
                <i class="fas fa-file-alt fa-3x"></i>
                <h3>No Uploaded Papers</h3>
                <p>No papers have been uploaded yet</p>
            </div>
        `;
        return;
    }
    
    // Create grid container
    const papersGrid = document.createElement('div');
    papersGrid.className = 'papers-grid';
    
    questions.forEach(question => {
        const paperCard = createAdminPaperCard(question, 'uploaded');
        papersGrid.appendChild(paperCard);
    });
    
    container.appendChild(papersGrid);
}

async function loadFeedback() {
    try {
        // Load feedback from localStorage
        loadFeedbackFromStorage();
        
        const tbody = document.getElementById('review-feedback-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (feedbackData.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No feedback available</td></tr>';
            return;
        }
        
        feedbackData.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.user}</td>
                <td>${item.feedback}</td>
                <td>${item.date}</td>
                <td><span class="status-badge ${item.status}">${item.status}</span></td>
                <td>
                    <button class="btn-mark-read" onclick="markFeedbackRead('${item.id}')">
                        <i class="fas fa-check"></i> Mark Read
                    </button>
                    <button class="btn-delete" onclick="deleteFeedback('${item.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
        
        console.log('Feedback loaded from localStorage:', feedbackData);
    } catch (error) {
        console.error('Error loading feedback:', error);
        showNotification('Failed to load feedback', 'error');
    }
}

function renderFeedback(feedback) {
    const tbody = document.getElementById('review-feedback-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (feedback.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No feedback</td></tr>';
        return;
    }
    
    feedback.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item._id}</td>
            <td>${item.user}</td>
            <td>${item.feedback}</td>
            <td>${item.date}</td>
            <td><span class="status-badge ${item.status}">${item.status}</span></td>
            <td>
                <button class="btn-mark-read" onclick="markFeedbackRead('${item._id}')">
                    <i class="fas fa-check"></i> Mark Read
                </button>
                <button class="btn-delete" onclick="deleteFeedback('${item._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function loadCourses() {
    try {
        console.log('Loading courses from API...');
        const response = await fetch(`${API_URL}/courses`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const courses = await response.json();
        console.log('Courses loaded:', courses);
        renderCourses(courses);
    } catch (error) {
        console.error('Error loading courses:', error);
        showNotification('Failed to load courses: ' + error.message, 'error');
        
        // Show empty state
        const tbody = document.getElementById('courses-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Error loading courses. Please try again.</td></tr>';
        }
    }
}

function renderCourses(courses) {
    const tbody = document.getElementById('courses-tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (courses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No courses found</td></tr>';
        return;
    }
    
    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.departmentCode}</td>
            <td>Semester ${course.semesterNumber}</td>
            <td><span class="status-badge active">ACTIVE</span></td>
            <td>
                <button class="btn-edit" onclick="editCourse('${course._id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteCourse('${course._id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// CRUD Functions for Departments and Courses
async function addDepartment() {
    const name = document.getElementById('dept-name').value;
    const code = document.getElementById('dept-code').value;
    const image = document.getElementById('dept-image').value;
    
    if (!name || !code) {
        showNotification('Please fill in department name and code', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                code: code.toUpperCase(),
                image: image || `https://picsum.photos/seed/${code}/400/300.jpg`
            })
        });
        
        if (!response.ok) throw new Error('Failed to add department');
        
        showNotification('Department added successfully!', 'success');
        
        // Clear form
        document.getElementById('dept-name').value = '';
        document.getElementById('dept-code').value = '';
        document.getElementById('dept-image').value = '';
        
        // Refresh departments
        await loadDepartments();
        
    } catch (error) {
        console.error('Error adding department:', error);
        showNotification('Failed to add department', 'error');
    }
}

async function deleteDepartment(deptId) {
    if (!confirm('Are you sure you want to delete this department? This will also delete all associated semesters and courses.')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/departments/${deptId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete department');
        
        showNotification('Department deleted successfully', 'success');
        await loadDepartments();
        
    } catch (error) {
        console.error('Error deleting department:', error);
        showNotification('Failed to delete department', 'error');
    }
}

function editDepartment(deptId) {
    // Find the department data
    const department = departments.find(dept => dept._id === deptId);
    if (!department) {
        showNotification('Department not found', 'error');
        return;
    }
    
    // Fill the edit form with current data
    document.getElementById('dept-name').value = department.name;
    document.getElementById('dept-code').value = department.code;
    document.getElementById('dept-image').value = department.image || '';
    
    // Add edit mode styling
    const addForm = document.querySelector('#admin-manage-departments .add-form');
    addForm.classList.add('edit-mode');
    
    // Change the button to update instead of add
    const addButton = document.querySelector('#admin-manage-departments .add-form button');
    addButton.textContent = 'Update Department';
    addButton.onclick = () => updateDepartment(deptId);
    
    // Scroll to the form
    addForm.scrollIntoView({ behavior: 'smooth' });
    
    showNotification('Edit the department details and click Update', 'info');
}

async function updateDepartment(deptId) {
    const name = document.getElementById('dept-name').value;
    const code = document.getElementById('dept-code').value;
    const image = document.getElementById('dept-image').value;
    
    if (!name || !code) {
        showNotification('Please fill in department name and code', 'error');
        return;
    }
    
    // Add loading state
    const addButton = document.querySelector('#admin-manage-departments .add-form button');
    addButton.disabled = true;
    addButton.textContent = 'Updating...';
    
    try {
        const response = await fetch(`${API_URL}/departments/${deptId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                code: code.toUpperCase(),
                image: image || `https://picsum.photos/seed/${code}/400/300.jpg`
            })
        });
        
        if (!response.ok) throw new Error('Failed to update department');
        
        showNotification('Department updated successfully!', 'success');
        
        // Reset form
        document.getElementById('dept-name').value = '';
        document.getElementById('dept-code').value = '';
        document.getElementById('dept-image').value = '';
        
        // Remove edit mode styling
        const addForm = document.querySelector('#admin-manage-departments .add-form');
        addForm.classList.remove('edit-mode');
        
        // Reset button back to Add
        addButton.disabled = false;
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add Department';
        addButton.onclick = addDepartment;
        
        // Refresh departments
        await loadDepartments();
        
    } catch (error) {
        console.error('Error updating department:', error);
        showNotification('Failed to update department', 'error');
        
        // Reset button state
        addButton.disabled = false;
        addButton.textContent = 'Update Department';
    }
}

async function addCourse() {
    const name = document.getElementById('course-name').value;
    const code = document.getElementById('course-code').value;
    const department = document.getElementById('course-dept').value;
    const semester = document.getElementById('course-semester').value;
    
    if (!name || !code || !department || !semester) {
        showNotification('Please fill in all course fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/courses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                code: code.toUpperCase(),
                departmentCode: department,
                semesterNumber: parseInt(semester)
            })
        });
        
        if (!response.ok) throw new Error('Failed to add course');
        
        showNotification('Course added successfully!', 'success');
        
        // Clear form
        document.getElementById('course-name').value = '';
        document.getElementById('course-code').value = '';
        document.getElementById('course-dept').value = '';
        document.getElementById('course-semester').value = '';
        
        // Refresh courses
        await loadCourses();
        
    } catch (error) {
        console.error('Error adding course:', error);
        showNotification('Failed to add course', 'error');
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete course');
        
        showNotification('Course deleted successfully', 'success');
        await loadCourses();
        
    } catch (error) {
        console.error('Error deleting course:', error);
        showNotification('Failed to delete course', 'error');
    }
}

function refreshDepartments() {
    showNotification('Refreshing departments...', 'info');
    loadDepartments();
}

function refreshCourses() {
    showNotification('Refreshing courses...', 'info');
    loadCourses();
}

// Feedback system
let feedbackData = [];

function submitFeedback() {
    const feedbackInput = document.querySelector('.feedback-input');
    const feedbackText = feedbackInput.value.trim();
    
    if (!feedbackText) {
        showNotification('Please enter feedback before sending', 'error');
        return;
    }
    
    const feedback = {
        id: Date.now().toString(),
        user: 'Anonymous User',
        feedback: feedbackText,
        date: new Date().toLocaleDateString(),
        status: 'unread'
    };
    
    // Store feedback in localStorage for demo
    feedbackData.push(feedback);
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
    
    // Clear input
    feedbackInput.value = '';
    
    showNotification('Feedback submitted successfully!', 'success');
    
    // If admin is viewing feedback, refresh it
    if (document.getElementById('admin-review-feedback').classList.contains('active')) {
        loadFeedback();
    }
}

// Load feedback from localStorage
function loadFeedbackFromStorage() {
    const stored = localStorage.getItem('feedbackData');
    if (stored) {
        feedbackData = JSON.parse(stored);
    }
}

// Initialize feedback system
document.addEventListener('DOMContentLoaded', function() {
    loadFeedbackFromStorage();
    
    // Add event listener to feedback button
    const feedbackBtn = document.querySelector('.feedback-btn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', submitFeedback);
    }
    
    // Add enter key support for feedback input
    const feedbackInput = document.querySelector('.feedback-input');
    if (feedbackInput) {
        feedbackInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitFeedback();
            }
        });
    }
});

// Additional helper functions

function markFeedbackRead(feedbackId) {
    try {
        // Find and update feedback status
        const feedbackIndex = feedbackData.findIndex(item => item.id === feedbackId);
        if (feedbackIndex !== -1) {
            feedbackData[feedbackIndex].status = 'read';
            localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
            
            // Refresh the feedback display
            loadFeedback();
            
            showNotification('Feedback marked as read', 'success');
        }
    } catch (error) {
        console.error('Error marking feedback as read:', error);
        showNotification('Failed to mark feedback as read', 'error');
    }
}

function deleteFeedback(feedbackId) {
    if (confirm('Are you sure you want to delete this feedback?')) {
        try {
            // Find and remove feedback
            const feedbackIndex = feedbackData.findIndex(item => item.id === feedbackId);
            if (feedbackIndex !== -1) {
                feedbackData.splice(feedbackIndex, 1);
                localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
                
                // Refresh the feedback display
                loadFeedback();
                
                showNotification('Feedback deleted', 'success');
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            showNotification('Failed to delete feedback', 'error');
        }
    }
}

function editCourse(courseId) {
    // Find the course data - we need to fetch it from the API
    fetch(`${API_URL}/courses`)
        .then(response => response.json())
        .then(courses => {
            const course = courses.find(c => c._id === courseId);
            if (!course) {
                showNotification('Course not found', 'error');
                return;
            }
            
            // Fill the edit form with current data
            document.getElementById('course-title').value = course.title;
            document.getElementById('course-code').value = course.code;
            document.getElementById('course-dept').value = course.departmentCode;
            document.getElementById('course-semester').value = course.semesterNumber;
            
            // Add edit mode styling
            const addForm = document.querySelector('#admin-manage-courses .add-form');
            addForm.classList.add('edit-mode');
            
            // Change the button to update instead of add
            const addButton = document.querySelector('#admin-manage-courses .add-form button');
            addButton.textContent = 'Update Course';
            addButton.onclick = () => updateCourse(courseId);
            
            // Scroll to the form
            addForm.scrollIntoView({ behavior: 'smooth' });
            
            showNotification('Edit the course details and click Update', 'info');
        })
        .catch(error => {
            console.error('Error fetching course:', error);
            showNotification('Failed to load course data', 'error');
        });
}

async function updateCourse(courseId) {
    const title = document.getElementById('course-title').value;
    const code = document.getElementById('course-code').value;
    const department = document.getElementById('course-dept').value;
    const semester = document.getElementById('course-semester').value;
    
    if (!title || !code || !department || !semester) {
        showNotification('Please fill in all course fields', 'error');
        return;
    }
    
    // Add loading state
    const addButton = document.querySelector('#admin-manage-courses .add-form button');
    addButton.disabled = true;
    addButton.textContent = 'Updating...';
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                code: code.toUpperCase(),
                departmentCode: department,
                semesterNumber: parseInt(semester)
            })
        });
        
        if (!response.ok) throw new Error('Failed to update course');
        
        showNotification('Course updated successfully!', 'success');
        
        // Clear form
        document.getElementById('course-title').value = '';
        document.getElementById('course-code').value = '';
        document.getElementById('course-dept').value = '';
        document.getElementById('course-semester').value = '';
        
        // Remove edit mode styling
        const addForm = document.querySelector('#admin-manage-courses .add-form');
        addForm.classList.remove('edit-mode');
        
        // Reset button back to Add
        addButton.disabled = false;
        addButton.innerHTML = '<i class="fas fa-plus"></i> Add Course';
        addButton.onclick = addCourse;
        
        // Refresh courses
        await loadCourses();
        
    } catch (error) {
        console.error('Error updating course:', error);
        showNotification('Failed to update course', 'error');
        
        // Reset button state
        addButton.disabled = false;
        addButton.textContent = 'Update Course';
    }
}

async function deleteCourse(courseId) {
    if (!confirm('Are you sure you want to delete this course?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete course');
        
        showNotification('Course deleted successfully', 'success');
        await loadCourses();
        
    } catch (error) {
        console.error('Error deleting course:', error);
        showNotification('Failed to delete course', 'error');
    }
}

// Upload Functions
function setupUploadForm() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.querySelector('.upload-area');
    
    if (!fileInput || !uploadArea) return;
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
}

async function handleFiles(files) {
    if (files.length === 0) return;
    
    for (let file of files) {
        await uploadFile(file);
    }
}

async function uploadFile(file) {
    // Get form data
    const title = document.getElementById('paper-title').value;
    const department = document.getElementById('paper-department').value;
    const semester = document.getElementById('paper-semester').value;
    const type = document.getElementById('paper-type').value;
    const year = document.getElementById('paper-year').value;
    const uploader = document.getElementById('paper-uploader').value;
    
    // Validate form
    if (!title || !department || !semester || !type || !year || !uploader) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Create paper data object
    const paperData = {
        title: title,
        driveLink: `https://drive.google.com/file/d/mock-${Date.now()}/view`, // Mock drive link
        type: type,
        year: parseInt(year),
        uploaderName: uploader,
        departmentCode: department,
        semesterNumber: parseInt(semester),
        status: currentUser?.role === 'admin' ? 'approved' : 'pending' // Admin uploads are auto-approved
    };
    
    try {
        // In a real implementation, you'd first upload the file to cloud storage
        // Then create the paper record with the actual drive link
        
        // For now, we'll simulate the API call
        showNotification(`Uploading ${file.name}...`, 'info');
        
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate API call to create paper
        const response = await fetch(`${API_URL}/papers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paperData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create paper record');
        }
        
        if (currentUser?.role === 'admin') {
            showNotification(`${file.name} uploaded and approved!`, 'success');
        } else {
            showNotification(`${file.name} uploaded and pending approval!`, 'success');
        }
        
        // Clear form
        document.getElementById('paper-title').value = '';
        document.getElementById('paper-department').value = '';
        document.getElementById('paper-semester').value = '';
        document.getElementById('paper-type').value = '';
        document.getElementById('paper-year').value = '2024';
        document.getElementById('paper-uploader').value = '';
        
        // Refresh relevant data
        if (currentUser?.role === 'admin') {
            await loadAdminStats();
        }
        
    } catch (error) {
        console.error('Error uploading file:', error);
        showNotification(`Failed to upload ${file.name}`, 'error');
    }
}

// Update showAdminSection to load data when switching sections
function showAdminSection(sectionName) {
    console.log('Showing admin section:', sectionName);
    
    // Prevent default link behavior
    if (event) {
        event.preventDefault();
    }
    
    // Hide all admin sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
        section.classList.remove('active');
    });
    
    // Show the requested admin section
    const targetSection = document.getElementById(`admin-${sectionName}`);
    console.log('Target section found:', !!targetSection);
    
    if (targetSection) {
        targetSection.classList.remove('hidden');
        targetSection.classList.add('active');
        console.log('Section activated:', sectionName);
        
        // Load data based on section
        if (sectionName === 'dashboard') {
            loadAdminStats();
        } else if (sectionName === 'pending' || sectionName === 'pending-papers') {
            loadPendingPapers();
        } else if (sectionName === 'uploaded-questions') {
            loadUploadedQuestions();
        } else if (sectionName === 'review-feedback') {
            loadFeedback();
        } else if (sectionName === 'manage-departments') {
            loadDepartments();
        } else if (sectionName === 'manage-courses') {
            loadCourses();
        }
    } else {
        console.log('Section not found, defaulting to dashboard');
        // Default to dashboard if section not found
        const dashboardSection = document.getElementById('admin-dashboard');
        if (dashboardSection) {
            dashboardSection.classList.remove('hidden');
            dashboardSection.classList.add('active');
            loadAdminStats();
        }
    }
    
    // Update active nav link
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load initial data
    loadDepartments();
    checkUserRole();
    setupUploadForm();
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Skip empty href attributes
            if (href && href !== '#') {
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        const toggleBtn = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth > 768) {
            // Close mobile menu on desktop
            document.querySelector('.sidebar').classList.remove('open');
            
            // Remove mobile toggle button if it exists
            if (toggleBtn) {
                document.body.removeChild(toggleBtn);
            }
        }
    });
});

// Add initial styles for hero title animation
const heroStyles = document.createElement('style');
heroStyles.textContent = `
    .hero-title {
        opacity: 1;
        transform: translateY(0);
        transition: all 0.8s ease;
    }
`;
document.head.appendChild(heroStyles);

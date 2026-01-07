// API Base URL
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

// Navigation
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const sectionId = button.getAttribute('data-section');
        
        // Update active button
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show selected section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    });
});

// Search Functionality
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const searchId = document.getElementById('searchId');
const searchName = document.getElementById('searchName');

searchBtn.addEventListener('click', searchStudents);
clearSearchBtn.addEventListener('click', clearSearch);

function searchStudents() {
    const id = searchId.value.trim();
    const name = searchName.value.trim();
    
    let url = `${API_BASE_URL}/students`;
    const params = [];
    
    if (id) params.push(`id=${encodeURIComponent(id)}`);
    if (name) params.push(`name=${encodeURIComponent(name)}`);
    
    if (params.length > 0) {
        url += '?' + params.join('&');
    }
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayStudents(data);
            showMessage('search', `Tìm thấy ${data.length} sinh viên`, 'success');
        })
        .catch(error => {
            console.error('Search error:', error);
            showMessage('search', 'Lỗi khi tìm kiếm sinh viên', 'error');
        });
}

function clearSearch() {
    searchId.value = '';
    searchName.value = '';
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = '';
    hideMessage('search');
}

function displayStudents(students) {
    const tableBody = document.querySelector('#studentsTable tbody');
    tableBody.innerHTML = '';
    
    if (students.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <i class="fas fa-search" style="font-size: 2rem; color: #6c757d; margin-bottom: 10px; display: block;"></i>
                    <p>Không tìm thấy sinh viên nào</p>
                </td>
            </tr>
        `;
        return;
    }
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${student.student_id}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.age || 'N/A'}</td>
            <td>${student.major || 'Chưa có'}</td>
            <td>${student.gpa ? student.gpa.toFixed(2) : 'N/A'}</td>
            <td>${new Date(student.enrollment_date).toLocaleDateString('vi-VN')}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Insert Functionality
const insertForm = document.getElementById('insertForm');

insertForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentData = {
        student_id: document.getElementById('insertId').value,
        name: document.getElementById('insertName').value,
        email: document.getElementById('insertEmail').value,
        age: document.getElementById('insertAge').value || null,
        major: document.getElementById('insertMajor').value || null,
        gpa: document.getElementById('insertGPA').value || null
    };
    
    fetch(`${API_BASE_URL}/students`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        showMessage('insert', 'Thêm sinh viên thành công!', 'success');
        insertForm.reset();
        // Refresh search results if search section is active
        if (document.getElementById('search').classList.contains('active')) {
            searchStudents();
        }
    })
    .catch(error => {
        console.error('Insert error:', error);
        showMessage('insert', 'Lỗi khi thêm sinh viên: ' + error.message, 'error');
    });
});

// Update Functionality
const loadStudentBtn = document.getElementById('loadStudentBtn');
const updateId = document.getElementById('updateId');
const updateForm = document.getElementById('updateForm');
const updateName = document.getElementById('updateName');
const updateEmail = document.getElementById('updateEmail');
const updateAge = document.getElementById('updateAge');
const updateMajor = document.getElementById('updateMajor');
const updateGPA = document.getElementById('updateGPA');

loadStudentBtn.addEventListener('click', loadStudentForUpdate);

function loadStudentForUpdate() {
    const studentId = updateId.value.trim();
    
    if (!studentId) {
        showMessage('update', 'Vui lòng nhập mã sinh viên', 'error');
        return;
    }
    
    fetch(`${API_BASE_URL}/students/${studentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không tìm thấy sinh viên');
            }
            return response.json();
        })
        .then(student => {
            updateName.value = student.name;
            updateEmail.value = student.email;
            updateAge.value = student.age || '';
            updateMajor.value = student.major || '';
            updateGPA.value = student.gpa || '';
            showMessage('update', 'Đã tải thông tin sinh viên', 'success');
        })
        .catch(error => {
            console.error('Load student error:', error);
            showMessage('update', error.message, 'error');
            clearUpdateForm();
        });
}

updateForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const studentId = updateId.value.trim();
    if (!studentId) {
        showMessage('update', 'Vui lòng nhập mã sinh viên', 'error');
        return;
    }
    
    const studentData = {
        name: updateName.value,
        email: updateEmail.value,
        age: updateAge.value || null,
        major: updateMajor.value || null,
        gpa: updateGPA.value || null
    };
    
    fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        showMessage('update', 'Cập nhật thông tin thành công!', 'success');
        clearUpdateForm();
        // Refresh search results
        if (document.getElementById('search').classList.contains('active')) {
            searchStudents();
        }
    })
    .catch(error => {
        console.error('Update error:', error);
        showMessage('update', 'Lỗi khi cập nhật: ' + error.message, 'error');
    });
});

function clearUpdateForm() {
    updateName.value = '';
    updateEmail.value = '';
    updateAge.value = '';
    updateMajor.value = '';
    updateGPA.value = '';
}

// Delete Functionality
const loadDeleteBtn = document.getElementById('loadDeleteBtn');
const deleteId = document.getElementById('deleteId');
const deleteBtn = document.getElementById('deleteBtn');
const studentPreview = document.getElementById('studentPreview');

loadDeleteBtn.addEventListener('click', loadStudentForDelete);
deleteBtn.addEventListener('click', deleteStudent);

function loadStudentForDelete() {
    const studentId = deleteId.value.trim();
    
    if (!studentId) {
        showMessage('delete', 'Vui lòng nhập mã sinh viên', 'error');
        return;
    }
    
    fetch(`${API_BASE_URL}/students/${studentId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Không tìm thấy sinh viên');
            }
            return response.json();
        })
        .then(student => {
            studentPreview.innerHTML = `
                <h4><i class="fas fa-user-circle"></i> Thông tin sinh viên sẽ bị xóa:</h4>
                <p><strong>Mã SV:</strong> ${student.student_id}</p>
                <p><strong>Họ tên:</strong> ${student.name}</p>
                <p><strong>Email:</strong> ${student.email}</p>
                <p><strong>Chuyên ngành:</strong> ${student.major || 'Chưa có'}</p>
                <p><strong>GPA:</strong> ${student.gpa ? student.gpa.toFixed(2) : 'N/A'}</p>
            `;
            deleteBtn.disabled = false;
            showMessage('delete', 'Đã tải thông tin sinh viên. Xác nhận xóa?', 'error');
        })
        .catch(error => {
            console.error('Load student for delete error:', error);
            showMessage('delete', error.message, 'error');
            studentPreview.innerHTML = '';
            deleteBtn.disabled = true;
        });
}

function deleteStudent() {
    const studentId = deleteId.value.trim();
    
    if (!confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentId}?`)) {
        return;
    }
    
    fetch(`${API_BASE_URL}/students/${studentId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        showMessage('delete', 'Xóa sinh viên thành công!', 'success');
        deleteId.value = '';
        studentPreview.innerHTML = '';
        deleteBtn.disabled = true;
        
        // Refresh search results
        if (document.getElementById('search').classList.contains('active')) {
            searchStudents();
        }
    })
    .catch(error => {
        console.error('Delete error:', error);
        showMessage('delete', 'Lỗi khi xóa: ' + error.message, 'error');
    });
}

// Utility Functions
function showMessage(section, text, type) {
    const messageElement = document.getElementById(`${section}Message`);
    messageElement.textContent = text;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // Auto hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

function hideMessage(section) {
    const messageElement = document.getElementById(`${section}Message`);
    messageElement.style.display = 'none';
}

// Load initial data on page load
document.addEventListener('DOMContentLoaded', () => {
    // Load all students on initial page load
    searchStudents();
});
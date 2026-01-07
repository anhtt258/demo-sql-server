const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'anhtt184',
    server: process.env.DB_SERVER || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME || 'DemoSchoolDB',
    options: {
        encrypt: true,
        trustServerCertificate: true
    }
};

// Create database connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Test database connection
poolConnect.then(() => {
    console.log('Connected to SQL Server successfully!');
    
    // Create Students table if not exists
    const createTableQuery = `
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Students' AND xtype='U')
        CREATE TABLE Students (
            id INT PRIMARY KEY IDENTITY(1,1),
            student_id VARCHAR(20) UNIQUE NOT NULL,
            name NVARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            age INT,
            major NVARCHAR(100),
            gpa DECIMAL(3,2),
            enrollment_date DATE DEFAULT GETDATE()
        )
    `;
    
    return pool.request().query(createTableQuery);
}).then(() => {
    console.log('Students table is ready!');
}).catch(err => {
    console.error('Database connection failed:', err);
});

// 1. GET all students or search
app.get('/api/students', async (req, res) => {
    try {
        await poolConnect;
        const { id, name } = req.query;
        
        let query = 'SELECT * FROM Students';
        const conditions = [];
        
        if (id) {
            conditions.push(`student_id LIKE '%${id}%'`);
        }
        if (name) {
            conditions.push(`name LIKE '%${name}%'`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY enrollment_date DESC';
        
        const result = await pool.request().query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching students:', err);
        res.status(500).json({ error: err.message });
    }
});

// 2. GET student by ID
app.get('/api/students/:id', async (req, res) => {
    try {
        await poolConnect;
        const studentId = req.params.id;
        const result = await pool.request()
            .input('id', sql.VarChar, studentId)
            .query('SELECT * FROM Students WHERE student_id = @id');
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error fetching student:', err);
        res.status(500).json({ error: err.message });
    }
});

// 3. POST create new student
app.post('/api/students', async (req, res) => {
    try {
        await poolConnect;
        const { student_id, name, email, age, major, gpa } = req.body;
        
        const query = `
            INSERT INTO Students (student_id, name, email, age, major, gpa)
            VALUES (@student_id, @name, @email, @age, @major, @gpa)
        `;
        
        await pool.request()
            .input('student_id', sql.VarChar, student_id)
            .input('name', sql.NVarChar, name)
            .input('email', sql.VarChar, email)
            .input('age', sql.Int, age)
            .input('major', sql.NVarChar, major)
            .input('gpa', sql.Decimal(3,2), gpa)
            .query(query);
        
        res.status(201).json({ message: 'Student created successfully' });
    } catch (err) {
        console.error('Error creating student:', err);
        res.status(500).json({ error: err.message });
    }
});

// 4. PUT update student
app.put('/api/students/:id', async (req, res) => {
    try {
        await poolConnect;
        const studentId = req.params.id;
        const { name, email, age, major, gpa } = req.body;
        
        const query = `
            UPDATE Students 
            SET name = @name, 
                email = @email, 
                age = @age, 
                major = @major, 
                gpa = @gpa 
            WHERE student_id = @student_id
        `;
        
        const result = await pool.request()
            .input('student_id', sql.VarChar, studentId)
            .input('name', sql.NVarChar, name)
            .input('email', sql.VarChar, email)
            .input('age', sql.Int, age)
            .input('major', sql.NVarChar, major)
            .input('gpa', sql.Decimal(3,2), gpa)
            .query(query);
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ message: 'Student updated successfully' });
    } catch (err) {
        console.error('Error updating student:', err);
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE student
app.delete('/api/students/:id', async (req, res) => {
    try {
        await poolConnect;
        const studentId = req.params.id;
        
        const result = await pool.request()
            .input('student_id', sql.VarChar, studentId)
            .query('DELETE FROM Students WHERE student_id = @student_id');
        
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('Error deleting student:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
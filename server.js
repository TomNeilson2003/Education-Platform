const express = require('express');
// const bcrypt = require('bcrypt'); // bcrypt is ignored for now
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use(express.static('views'));
app.use(express.static('Keystage1'));
app.use(express.static('Keystage2'));
app.use(express.static('Keystage3'));
app.use(express.static('Keystage4'));

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // This allows self-signed certs
    }
  }
});


const session = require('express-session'); // Add this at the top with other requires

// Add this after your const app = express(); line
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Define Models (Teachers, Classes, Students, Progress, StudentClass)
const Teacher = sequelize.define('Teacher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    username: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    name: DataTypes.STRING // Teacher's full name
});

const Class = sequelize.define('Class', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: { type: DataTypes.STRING, unique: true },
    name: DataTypes.STRING
});

const Student = sequelize.define('Student', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: DataTypes.STRING, // Student's first name
    lastName: DataTypes.STRING,  // Student's last name
    username: { type: DataTypes.STRING, unique: true }
});

const Progress = sequelize.define('Progress', {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    gameName: DataTypes.STRING,
    completed: DataTypes.BOOLEAN,
    stepsTaken: DataTypes.INTEGER,
    bestSteps: { 
        type: DataTypes.INTEGER, 
        allowNull: true 
    },
    attempts: { 
        type: DataTypes.INTEGER, 
        defaultValue: 0 
    },
    lastPlayed: { 
        type: DataTypes.DATE, 
        defaultValue: DataTypes.NOW 
    },
    keystage: {  
        type: DataTypes.STRING,
        allowNull: false
    },
    level: 
    { type: DataTypes.INTEGER, 
        defaultValue: 1 }
});

Student.hasMany(Progress, { foreignKey: 'studentId' });
Progress.belongsTo(Student, { foreignKey: 'studentId' });

// Junction table for many-to-many relationship between Student and Class
const StudentClass = sequelize.define('StudentClass', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
});

// Define Relationships (Updated for Many-to-Many Student-Class) - Only defined once now
Teacher.hasMany(Class, { foreignKey: 'teacherId' });
Class.belongsTo(Teacher, { foreignKey: 'teacherId' });

Student.belongsToMany(Class, { through: StudentClass }); // Student can belong to many classes
Class.belongsToMany(Student, { through: StudentClass }); // Class can have many students through StudentClass

Student.hasMany(Progress, { foreignKey: 'studentId' });
Progress.belongsTo(Student, { foreignKey: 'studentId' }); // Added relationship for Progress -> Student


async function createTestData() {
    const existingTeacher = await Teacher.findOne({ where: { username: 'testteacher' } });
    if (!existingTeacher) {
        const teacher = await Teacher.create({
            username: 'testteacher',
            password: 'password123', // bcrypt ignored - storing plain text password for now
            name: 'Ms. Smith'
        });

        const testClass = await Class.create({
            name: 'Mathematics 101',
            code: 'MATH101',
            teacherId: teacher.id
        });
        console.log('Test teacher and class created.');
    } else {
        console.log('Test teacher already exists, skipping creation.');
    }
}

sequelize.sync({ force: false }).then(() => {
    console.log('Database synced and test data created');
    createTestData();
});

// Routes

// Add this logout route handler
// Update your logout route to this
app.post('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).send('Logout failed');
            }
            
            // Clear session cookie
            res.clearCookie('connect.sid'); // This is the default cookie name
            
            // Redirect to login page
            res.redirect('/index.html');
        });
    } else {
        // No session existed
        res.redirect('/index.html');
    }
});

// Teacher Registration Route (Fixed Implementation - bcrypt ignored)
app.post('/api/teachers', async (req, res) => {
    try {
        const { username, password, name } = req.body;

        // Validate required fields
        if (!username || !password || !name) {
            return res.status(400).json({ error: 'All fields are required: username, password, and name' });
        }

        // Check for existing username
        const existingTeacher = await Teacher.findOne({ where: { username } });
        if (existingTeacher) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        // Hash password - bcrypt ignored, storing plain text password
        const hashedPassword = password; // Plain text password - INSECURE!
        // const hashedPassword = await bcrypt.hash(password, 10); // Original bcrypt line

        // Create teacher
        const newTeacher = await Teacher.create({
            username,
            password: hashedPassword, // Store plain text password
            name
        });

        // Return response without password
        res.status(201).json({
            teacherId: newTeacher.id,
            username: newTeacher.username,
            name: newTeacher.name
        });

    } catch (error) {
        console.error('Teacher registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
});


app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for username: ${username}`); // Log username

    try {
        const teacher = await Teacher.findOne({
            where: { username }
        });

        if (!teacher) {
            console.log(`Teacher not found for username: ${username}`); // Log if teacher not found
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Password comparison - bcrypt ignored, direct plain text comparison
        const passwordMatch = (password === teacher.password); // Direct plain text comparison - INSECURE!
        // const passwordMatch = await bcrypt.compare(password, teacher.password); // Original bcrypt line

        if (passwordMatch) {
            console.log(`Password match successful for username: ${username}, teacherId: ${teacher.id}`); // Log successful login
            res.json({ success: true, teacherId: teacher.id, username: teacher.username, name: teacher.name });
        } else {
            console.log(`Password did not match for username: ${username}, teacherId: ${teacher.id}`); // Log failed password comparison
            return res.status(401).json({ error: 'Invalid credentials' }); // Return here
        }
    } catch (error) {
        console.error("Error during login process:", error); // Log any errors during login
        res.status(500).json({ error: 'Login failed' });
    }
});


// Class Routes (No changes needed for class creation and fetching classes for teacher)
app.post('/api/classes', async (req, res) => {
    const { teacherId, className } = req.body; // Expect teacherId and className
    if (!teacherId || !className) {
        return res.status(400).json({ error: 'Teacher ID and class name are required' });
    }

    try {
        const newClass = await Class.create({
            name: className,
            code: generateClassCode(), // Implement generateClassCode function
            teacherId: teacherId
        });
        res.status(201).json({
            id: newClass.id,
            name: newClass.name,
            code: newClass.code
        });
    } catch (error) {
        console.error('Error creating class:', error);
        res.status(500).json({ error: 'Failed to create class' });
    }
});

// Helper function to generate class code
function generateClassCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}
// Add this endpoint if not already present
app.get('/api/classes/:teacherId', async (req, res) => {
    try {
        const classes = await Class.findAll({
            where: { teacherId: req.params.teacherId },
            include: [{
                model: Student,
                through: { attributes: [] },
                attributes: ['id', 'firstName', 'lastName', 'username']
            }]
        });

        res.json(classes.map(c => ({
            id: c.id,
            name: c.name,
            code: c.code,
            Students: c.Students
        })));

    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ error: 'Failed to fetch classes' });
    }
});

// Get students in a class (Adjusted for Many-to-Many Relationship)
app.get('/api/classes/:classCode/students', async (req, res) => {
    const classCode = req.params.classCode;

    if (!classCode) {
        return res.status(400).json({ error: 'Class code is required' });
    }

    try {
        const targetClass = await Class.findOne({ where: { code: classCode } });
        if (!targetClass) {
            return res.status(404).json({ error: 'Class not found with this code' });
        }

        const students = await Student.findAll({
            include: [{
                model: Class,
                through: StudentClass, // Specify the junction table
                where: { id: targetClass.id }
            }],
            attributes: ['id', 'firstName', 'lastName', 'username'] // Fetch first and last names
        });

        const studentList = students.map(student => ({
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            username: student.username
        }));

        res.json({ classCode: classCode, className: targetClass.name, students: studentList }); // Return student objects

    } catch (error) {
        console.error("Error fetching student names for class:", error);
        res.status(500).json({ error: 'Failed to fetch student names', details: error.message });
    }
});


// Student Registration Route (Modified for First/Last Name and Many-to-Many Classes)
app.post('/api/student-register', async (req, res) => {
    const { username, classCode, firstName, lastName } = req.body; // Expecting first and last names

    if (!username || !classCode || !firstName || !lastName) {
        return res.status(400).json({ error: 'Username, Class Code, First Name, and Last Name are required for registration.' });
    }

    try {
        const targetClass = await Class.findOne({
            where: { code: classCode },
            include: [Teacher] // Include Teacher model to get teacher info
        });
        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }

        const newStudent = await Student.create({
            username: username,
            firstName: firstName, // Store first name
            lastName: lastName  // Store last name
        });

        await newStudent.addClass(targetClass); // Associate student with the class through junction table

        res.status(201).json({
            message: 'Student registered and joined class successfully',
            studentId: newStudent.id,
            studentUsername: newStudent.username,
            firstName: newStudent.firstName, // Return first name
            lastName: newStudent.lastName,  // Return last name
            classId: targetClass.id, // Return the joined class ID
            className: targetClass.name,
            teacherName: targetClass.Teacher.name
        });

    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username already taken.' });
        }
        console.error("Error registering student:", error);
        res.status(500).json({ error: 'Failed to register student', details: error.message });
    }
});


// Student Login Route (Modified to return all enrolled classes)
app.post('/api/student-login', async (req, res) => {
    try {
        const student = await Student.findOne({
            where: { username: req.body.username },
            include: [{
                model: Class,
                include: [Teacher] // Include Teacher for each class
            }]
        });

        if (!student) return res.status(404).json({ error: 'Student not found' });

        const enrolledClasses = student.Classes.map(cls => ({ // Map over the classes
            id: cls.id,
            name: cls.name,
            code: cls.code,
            teacherName: cls.Teacher.name // Include teacher name for each class
        }));


        res.json({
            success: true,
            studentId: student.id,
            studentUsername: student.username,
            firstName: student.firstName, // Return first name
            lastName: student.lastName,  // Return last name
            classes: enrolledClasses // Return array of enrolled classes
        });

    } catch (error) {
        console.error("Error during student login:", error);
        res.status(500).json({ error: 'Login failed', details: error.message });
    }
});


// Add these endpoints for game progress
app.post('/api/game/record-completion', async (req, res) => {
    try {
        const { studentId, gameName, stepsTaken, completed, keystage } = req.body;
        
        if (!studentId || !gameName || typeof completed === 'undefined') {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const [progress, created] = await Progress.findOrCreate({
            where: {
                studentId: studentId,
                gameName: gameName
            },
            defaults: {
                completed: completed,
                stepsTaken: stepsTaken,
                bestSteps: stepsTaken,
                attempts: 1,
                lastPlayed: new Date(),
                keystage: keystage
            } 
        });

        if (!created) {
            progress.attempts += 1;
            progress.lastPlayed = new Date();
            progress.completed = completed || progress.completed;

            if (completed && stepsTaken < progress.bestSteps) {
                progress.bestSteps = stepsTaken;
            }

            if (stepsTaken) {
                progress.stepsTaken = stepsTaken;
            }

            await progress.save();
        }

        res.json(progress);
    } catch (error) {
        console.error("Error saving progress:", error);
        res.status(500).json({ error: "Failed to save progress" });
    }
});


app.get('/api/progress/:studentId', async (req, res) => {
    try {
        const student = await Student.findByPk(req.params.studentId);
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        const progress = await Progress.findAll({
            where: { studentId: req.params.studentId },
            order: [['lastPlayed', 'DESC']]
        });
        
        res.json(progress);
    } catch (error) {
        console.error("Progress fetch error:", error);
        res.status(500).json({ error: "Failed to fetch progress", details: error.message });
    }
});


// Get detailed student progress (for teachers)
// Get detailed student progress (for teachers)
app.get('/api/teacher/student-progress/:studentId', async (req, res) => {
    try {
        const progress = await Progress.findAll({
            where: { studentId: req.params.studentId },
            include: [{
                model: Student,
                attributes: ['firstName', 'lastName']
            }],
            order: [['gameName', 'ASC']]
        });
        
        res.json(progress);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch progress" });
    }
});

// Get classes for a teacher
app.get('/api/classes/:teacherId', async (req, res) => {
    try {
        const classes = await Class.findAll({
            where: { teacherId: req.params.teacherId },
            include: [{
                model: Student,
                through: { attributes: [] },
                attributes: ['id']
            }]
        });
        
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// Get classes for a teacher
app.get('/api/classes/:teacherId', async (req, res) => {
    try {
        const classes = await Class.findAll({
            where: { teacherId: req.params.teacherId },
            include: [{
                model: Student,
                through: { attributes: [] },
                attributes: ['id']
            }]
        });
        
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch classes" });
    }
});

// GET endpoint for fetching a student's enrolled classes.
app.get('/api/students/:studentId/classes', async (req, res) => {
    try {
      const student = await Student.findByPk(req.params.studentId, {
        include: [{
          model: Class,
          include: [Teacher]
        }]
      });
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
  
      // Map through the classes and return necessary details.
      const enrolledClasses = student.Classes.map(cls => ({
        id: cls.id,
        name: cls.name,
        code: cls.code,
        teacherName: cls.Teacher ? cls.Teacher.name : 'N/A'
      }));
  
      res.json(enrolledClasses);
    } catch (error) {
      console.error("Error fetching student's classes:", error);
      res.status(500).json({ error: 'Failed to fetch classes', details: error.message });
    }
  });

  app.post('/api/students/:studentId/classes', async (req, res) => {
    const { classCode } = req.body;
    const studentId = req.params.studentId;

    if (!classCode) {
        return res.status(400).json({ error: 'Class code is required' });
    }

    try {
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const targetClass = await Class.findOne({ where: { code: classCode } });
        if (!targetClass) {
            return res.status(404).json({ error: 'Invalid class code' });
        }

        // Check if the student is already in the class
        const isAlreadyInClass = await StudentClass.findOne({
            where: { StudentId: studentId, ClassId: targetClass.id }
        });

        if (isAlreadyInClass) {
            return res.status(400).json({ error: 'Student is already enrolled in this class' });
        }

        await student.addClass(targetClass); // Use the association method to add the class

        res.json({ message: 'Successfully joined the class', classId: targetClass.id, className: targetClass.name });

    } catch (error) {
        console.error('Error joining class:', error);
        res.status(500).json({ error: 'Failed to join class', details: error.message });
    }
});

  
// Endpoint for teacher to assign a game/task to multiple students.
const AssignedGame = sequelize.define('AssignedGame', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    gameName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  });

Teacher.hasMany(AssignedGame, { foreignKey: 'teacherId' });
AssignedGame.belongsTo(Teacher, { foreignKey: 'teacherId' });

  
// NEW: Endpoint for teacher to assign a game/task to multiple students.
app.post('/api/teacher/assign-game', async (req, res) => {
    try {
      const { teacherId, studentIds, gameName } = req.body;
      if (!teacherId || !studentIds || !gameName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      for (const studentId of studentIds) {
        await AssignedGame.create({
          teacherId,
          studentId,
          gameName
        });
      }
      console.log(`Teacher ${teacherId} assigned game ${gameName} to students: ${studentIds.join(', ')}`);
      res.json({ message: 'Game assigned successfully' });
    } catch (error) {
      console.error('Error assigning game:', error);
      res.status(500).json({ error: 'Failed to assign game' });
    }
  });
//Endpoint for teacher to assign a game/task to multiple students.
app.post('/api/teacher/assign-game', async (req, res) => {
    try {
      const { teacherId, studentIds, gameName } = req.body;
      if (!teacherId || !studentIds || !gameName) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      for (const studentId of studentIds) {
        await AssignedGame.create({
          teacherId,
          studentId,
          gameName
        });
      }
      console.log(`Teacher ${teacherId} assigned game ${gameName} to students: ${studentIds.join(', ')}`);
      res.json({ message: 'Game assigned successfully' });
    } catch (error) {
      console.error('Error assigning game:', error);
      res.status(500).json({ error: 'Failed to assign game' });
    }
  });
  
    
  
// NEW: Endpoint for a student to fetch assigned games.
app.get('/api/assigned-games/:studentId', async (req, res) => {
    try {
      const assignments = await AssignedGame.findAll({
        where: { studentId: req.params.studentId },
        include: [{ model: Teacher, attributes: ['name'] }],
        order: [['assignedAt', 'DESC']]
      });
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assigned games:', error);
      res.status(500).json({ error: 'Failed to fetch assigned games' });
    }
  });

  app.post('/api/game/record-debug-progress', async (req, res) => {
    const { studentId, level, attempts } = req.body;
    if (!studentId || level === undefined || attempts === undefined) {
      return res.status(400).json({ error: "Student ID, level, and attempts are required" });
    }
    try {
      const [progress, created] = await Progress.findOrCreate({
        where: { studentId, gameName: "cosmo-debugging" },
        defaults: { level: level, attempts: attempts, keystage: "debugging" }
      });
      if (!created) {
        // Update if the new level is higher or update attempts regardless.
        if (level > progress.level) {
          progress.level = level;
        }
        progress.attempts = attempts;
        await progress.save();
      }
      res.json({ message: "Debug progress recorded", level, attempts });
    } catch (error) {
      console.error("Error recording debug progress", error);
      res.status(500).json({ error: "Failed to record progress", details: error.message });
    }
  });
  
  // GET endpoint to retrieve debug progress
  app.get('/api/game/get-debug-progress', async (req, res) => {
    const { studentId } = req.query;
    if (!studentId) {
      return res.status(400).json({ error: "Student ID is required" });
    }
    try {
      const progress = await Progress.findOne({
        where: { studentId, gameName: "cosmo-debugging" }
      });
      if (progress) {
        res.json({ level: progress.level, attempts: progress.attempts });
      } else {
        res.json({ level: 1, attempts: 0 });
      }
    } catch (error) {
      console.error("Error retrieving debug progress", error);
      res.status(500).json({ error: "Failed to retrieve progress", details: error.message });
    }
  });

  app.post('/api/game/record-password-progress', async (req, res) => {
    try {
        const { studentId, gameName, level } = req.body;
        
        // Validate required fields
        if (!studentId || !gameName || !level) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [progress, created] = await Progress.findOrCreate({
            where: {
                studentId,
                gameName,
                keystage: 'Keystage2'
            },
            defaults: {
                level: Math.min(level, 5), // Password game specific cap
                completed: level >= 5,
                attempts: 1,
                lastPlayed: new Date()
            }
        });

        if (!created) {
            progress.level = Math.max(progress.level, Math.min(level, 5));
            progress.completed = progress.completed || level >= 5;
            progress.attempts += 1;
            progress.lastPlayed = new Date();
            await progress.save();
        }

        res.json(progress);
    } catch (error) {
        console.error("Password Progress Error:", error);
        res.status(500).json({ error: "Failed to save password progress" });
    }
});

app.post('/api/game/record-completion-ks2', async (req, res) => {
    try {
        const { studentId, gameName, level } = req.body;
        
        // Validate required fields
        if (!studentId || !gameName || !level) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const [progress, created] = await Progress.findOrCreate({
            where: {
                studentId,
                gameName,
                keystage: 'Keystage2'
            },
            defaults: {
                level: level,
                completed: true,
                attempts: 1,
                lastPlayed: new Date()
            }
        });

        if (!created) {
            // Only update if new level is higher
            if (level > progress.level) {
                progress.level = level;
            }
            progress.attempts += 1;
            progress.lastPlayed = new Date();
            await progress.save();
        }

        res.json(progress);
    } catch (error) {
        console.error("KS2 Progress Error:", error);
        res.status(500).json({ error: "Failed to save KS2 progress" });
    }
});

app.post('/api/game/record-netnav-progress', async (req, res) => {
    try {
        const { studentId, level } = req.body;
        
        // Find an existing progress record for this student and game
        let progress = await Progress.findOne({
            where: { 
                studentId,
                gameName: 'net-navigator-junior',
                keystage: 'Keystage2'
            }
        });
        
        if (progress) {
            // Update existing progress
            progress.level = Math.min(level, 12);
            progress.completed = level >= 12;
            progress.attempts += 1;
            progress.lastPlayed = new Date();
            await progress.save();
        } else {
            // Create a new progress record
            progress = await Progress.create({
                studentId,
                gameName: 'net-navigator-junior',
                level: Math.min(level, 12),
                completed: level >= 12,
                attempts: 1,
                lastPlayed: new Date(),
                keystage: 'Keystage2'
            });
        }
        
        res.json(progress);
    } catch (error) {
        console.error("Net Navigator Progress Error:", error);
        res.status(500).json({ error: "Failed to save progress" });
    }
});


app.get('/api/progress/netnav/:studentId', async (req, res) => {
    try {
        const progress = await Progress.findOne({
            where: { 
                studentId: req.params.studentId,
                gameName: 'net-navigator-junior',
                keystage: 'Keystage2'
            }
        });
        
        res.json(progress || { 
            level: 0,
            attempts: 0
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch progress" });
    }
});

// Update the parrot progress endpoint
app.get('/api/progress/parrot/:studentId', async (req, res) => {
    try {
        const progress = await Progress.findOne({
            where: { 
                studentId: req.params.studentId,
                gameName: 'parrot-adventure',
                keystage: 'Keystage2'
            }
        });
        
        res.json(progress || { 
            level: 1,  // Default to first level (1-based)
            attempts: 0
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch parrot progress" });
    }
});


// NEW: Endpoint for fetching Password Adventure progress for Keystage2
app.get('/api/progress/password/:studentId', async (req, res) => {
    try {
        const progress = await Progress.findOne({
            where: { 
                studentId: req.params.studentId,
                gameName: 'password-adventure',
                keystage: 'Keystage2'
            }
        });
        
        // If no progress is found, return a default progress (level 0 and 0 attempts)
        res.json(progress || { 
            level: 0,
            attempts: 0
        });
    } catch (error) {
        console.error("Error fetching password game progress:", error);
        res.status(500).json({ error: "Failed to fetch password game progress" });
    }
});


  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
  });
  
  

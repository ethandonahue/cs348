require("dotenv").config({ path: __dirname + "/.env" });
const express = require('express');
const pool = require(__dirname + "/config/db.config.js");
const Student = require('./models/Student');
const Task = require('./models/Task');
const TaskStudent = require('./models/TaskStudent');

const app = express();
const cors = require("cors");

app.use(cors({
    origin: "https://cs348-project-ejdonahu.vercel.app"
}));
app.use(express.json());

const PORT = process.env.PORT || 9000;

pool.query(`
    CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
    )
`, (err, res) => {
    if (err) {
        console.error('Error creating table:', err);
    } else {
        console.log('Table created or already exists');
    }
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const addStudent = async (req, res) => {
    const { name } = req.body;
    try {
        await pool.query('BEGIN');
        const query = {
            name: 'add-student',
            text: 'INSERT INTO students (name) VALUES ($1) RETURNING *',
            values: [name]
        };
        const newStudent = await pool.query(query);
        await pool.query('COMMIT');
        res.status(201).json(newStudent.rows[0]);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error adding student:', error);
        res.status(500).json({ error: 'Failed to add student' });
    }
};

const getStudents = async (req, res) => {
    try {
        await pool.query('BEGIN');
        const students = await Student.findAll();
        await pool.query('COMMIT');
        res.status(200).json(students);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
};

const addTask = async (req, res) => {
    const { title, description, dueDate, priority, studentIds } = req.body;
    try {
        await pool.query('BEGIN');
        const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : new Date().toISOString();
        const newTask = await Task.create({
            title,
            description,
            due_date: formattedDueDate,
            priority
        });

        const taskId = newTask.id;
        const taskStudents = studentIds.map(studentId => ({
            task_id: taskId,
            student_id: studentId
        }));

        await TaskStudent.bulkCreate(taskStudents);

        await pool.query('COMMIT');
        res.status(201).json({ taskId });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error adding task:', error);
        res.status(500).json({ error: 'Failed to add task' });
    }
};

const getTasks = async (req, res) => {
    try {
        await pool.query('BEGIN');
        const tasks = await pool.query(`
            SELECT tasks.id, tasks.title, tasks.description, tasks.due_date, tasks.priority, 
            array_agg(json_build_object('id', students.id, 'name', students.name)) AS assigned_students
            FROM tasks
            LEFT JOIN task_students ON tasks.id = task_students.task_id
            LEFT JOIN students ON task_students.student_id = students.id
            GROUP BY tasks.id
        `);
        await pool.query('COMMIT');
        res.status(200).json(tasks.rows);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};

const removeTask = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        await pool.query('BEGIN');
        await Task.destroy({
            where: {
                id: taskId
            }
        });

        await TaskStudent.destroy({
            where: {
                task_id: taskId
            }
        });
        await pool.query('COMMIT');
        res.status(200).json({ message: 'Task removed successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error removing task:', error);
        res.status(500).json({ error: 'Failed to remove task' });
    }
};

const editTask = async (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, dueDate, priority, studentIds } = req.body;
    try {
        await pool.query('BEGIN');
        const updateTaskQuery = {
            name: 'update-task',
            text: 'UPDATE tasks SET title = $1, description = $2, due_date = $3, priority = $4 WHERE id = $5',
            values: [title, description, dueDate, priority, taskId]
        };
        await pool.query(updateTaskQuery);

        const deleteTaskStudentsQuery = {
            name: 'delete-task-students',
            text: 'DELETE FROM task_students WHERE task_id = $1',
            values: [taskId]
        };
        await pool.query(deleteTaskStudentsQuery);

        const taskStudentValues = studentIds.map(studentId => [taskId, studentId]);

        for (const values of taskStudentValues) {
            const taskStudentQuery = {
                name: 'insert-task-students',
                text: 'INSERT INTO task_students (task_id, student_id) VALUES ($1, $2)',
                values: values
            };
            await pool.query(taskStudentQuery);
        }

        await pool.query('COMMIT');
        res.status(200).json({ message: 'Task updated successfully' });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};

const getTaskById = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        await pool.query('BEGIN');
        const taskQuery = {
            name: 'get-task-by-id',
            text: 'SELECT * FROM tasks WHERE id = $1',
            values: [taskId]
        };
        const task = await pool.query(taskQuery);

        const taskStudentsQuery = {
            name: 'get-task-students',
            text: 'SELECT task_students.student_id, students.name FROM task_students INNER JOIN students ON task_students.student_id = students.id WHERE task_students.task_id = $1',
            values: [taskId]
        };
        const taskStudents = await pool.query(taskStudentsQuery);

        const taskWithStudents = {
            ...task.rows[0],
            assigned_students: taskStudents.rows
        };

        await pool.query('COMMIT');
        res.status(200).json(taskWithStudents);
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error fetching task by ID:', error);
        res.status(500).json({ error: 'Failed to fetch task by ID' });
    }
};

app.post("/addStudent", addStudent);
app.get("/getStudents", getStudents);
app.post("/addTask", addTask);
app.get("/getTasks", getTasks);
app.delete("/removeTask/:taskId", removeTask);
app.put("/editTask/:taskId", editTask);
app.get("/getTask/:taskId", getTaskById);

app.listen(PORT, () => {
    console.log(`Server listening on the port ${PORT}`);
});

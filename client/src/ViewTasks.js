import React, { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

function ViewTasks() {
    const [tasks, setTasks] = useState([]);
    const [students, setStudents] = useState([]);
    const [priorityFilter, setPriorityFilter] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('https://cs348.vercel.app/getTasks');
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const fetchedTasks = await response.json();
                if (!fetchedTasks) {
                    setTasks([])
                } else {
                    setTasks(fetchedTasks);
                }
            } catch (error) {
                console.error('Error fetching tasks:', error);
            }
        };

        const fetchStudents = async () => {
            try {
                const response = await fetch('https://cs348.vercel.app/getStudents');
                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }
                const fetchedStudents = await response.json();
                setStudents(fetchedStudents);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchTasks();
        fetchStudents();
    }, []);

    // Function to delete a task
    const handleDeleteTask = async (taskId) => {
        try {
            const response = await fetch(`https://cs348.vercel.app/removeTask/${taskId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove task');
            }

            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error('Error removing task:', error);
        }
    };

    const adjustDueDate = (dueDate) => {
        return new Date(new Date(dueDate).getTime() - (4 * 60 * 60 * 1000));
    };

    const formatDueDate = (dueDate) => {
        const offsetDate = adjustDueDate(dueDate);
        return offsetDate.toLocaleString();
    };

    // Function to get the day with the most tasks
    const getMaxTaskDay = (tasks) => {
        const taskCountsByDay = {};
        tasks.forEach(task => {
            const taskDate = adjustDueDate(task.due_date);
            const taskDay = taskDate.toLocaleDateString();
            taskCountsByDay[taskDay] = (taskCountsByDay[taskDay] || 0) + 1;
        });

        // Convert the object to an array of objects with day and count properties
        const taskCountsArray = Object.entries(taskCountsByDay).map(([day, count]) => ({ day, count }));

        // Sort the array by increasing date
        taskCountsArray.sort((a, b) => new Date(a.day) - new Date(b.day));

        // Find the maximum task count and the corresponding day
        const maxTaskCount = Math.max(...taskCountsArray.map(item => item.count));
        const maxTaskDayItem = taskCountsArray.find(item => item.count === maxTaskCount);

        return {
            day: maxTaskDayItem ? maxTaskDayItem.day : null,
            count: maxTaskCount
        };
    };


    // Function to get the day with the least tasks
    const getMinTaskDay = (tasks) => {
        const taskCountsByDay = {};
        tasks.forEach(task => {
            const taskDate = adjustDueDate(task.due_date);
            const taskDay = taskDate.toLocaleDateString();
            taskCountsByDay[taskDay] = (taskCountsByDay[taskDay] || 0) + 1;
        });

        // Convert the object to an array of objects with day and count properties
        const taskCountsArray = Object.entries(taskCountsByDay).map(([day, count]) => ({ day, count }));

        // Sort the array by increasing date
        taskCountsArray.sort((a, b) => new Date(a.day) - new Date(b.day));

        // Find the minimum task count and the corresponding day
        const minTaskCount = Math.min(...taskCountsArray.map(item => item.count));
        const minTaskDayItem = taskCountsArray.find(item => item.count === minTaskCount);

        return {
            day: minTaskDayItem ? minTaskDayItem.day : null,
            count: minTaskCount
        };
    };


    const getMostImportantTask = (tasks) => {
        const now = new Date();
        let mostImportantTask = null;
        tasks.forEach(task => {
            const taskDueDate = adjustDueDate(task.due_date);
            if (!mostImportantTask || taskDueDate < mostImportantTask.dueDate || (taskDueDate.getTime() === mostImportantTask.dueDate.getTime() && task.priority > mostImportantTask.priority)) {
                mostImportantTask = { title: task.title, dueDate: taskDueDate, priority: task.priority };
            }
        });
        return mostImportantTask;
    };

    // Function to find the least important task (due furthest away with lowest priority)
    const getLeastImportantTask = (tasks) => {
        let leastImportantTask = null;
        tasks.forEach(task => {
            const taskDueDate = adjustDueDate(task.due_date);
            if (!leastImportantTask || taskDueDate > leastImportantTask.dueDate || (taskDueDate.getTime() === leastImportantTask.dueDate.getTime() && task.priority < leastImportantTask.priority)) {
                leastImportantTask = { title: task.title, dueDate: taskDueDate, priority: task.priority };
            }
        });
        return leastImportantTask;
    };

    // Function to calculate average priority
    const calculateAveragePriority = (tasks) => {
        const totalPriority = tasks.reduce((sum, task) => sum + task.priority, 0);
        return totalPriority / tasks.length;
    };

    // Function to calculate average number of students
    const calculateAverageStudents = (tasks) => {
        const totalStudents = tasks.reduce((sum, task) => sum + task.assigned_students.length, 0);
        return totalStudents / tasks.length;
    };

    // Filter tasks based on priority, assigned students, date range, and search term
    const filteredTasks = tasks.filter(task => {
        if (priorityFilter !== '' && task.priority !== parseInt(priorityFilter)) {
            return false;
        }
        if (selectedStudents.length > 0 && !selectedStudents.every(studentId => task.assigned_students.some(student => parseInt(student.id) === parseInt(studentId)))) {
            return false;
        }
        if (startDate && endDate) {
            const taskDueDate = adjustDueDate(task.due_date); // Adjust the due date here
            const start = new Date(startDate);
            const end = new Date(endDate);

            taskDueDate.setHours(0, 0, 0, 0);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);


            if (taskDueDate <= start || taskDueDate >= end) {
                return false;
            }
        }
        if (searchTerm && searchTerm.trim() !== '') {
            const searchRegex = new RegExp(searchTerm.trim(), 'i');
            if (!searchRegex.test(task.title) && !searchRegex.test(task.description)) {
                return false;
            }
        }
        return true;
    });

    const handleCheckboxChange = (event) => {
        const studentId = event.target.value;
        const isChecked = event.target.checked;

        setSelectedStudents(prevSelectedStudents => {
            const selectedStudents = [...prevSelectedStudents];
            const index = selectedStudents.indexOf(studentId);

            if (isChecked && index === -1) {
                selectedStudents.push(studentId);
            } else if (!isChecked && index !== -1) {
                selectedStudents.splice(index, 1);
            }
            return selectedStudents;
        });
    };

    const maxTask = getMaxTaskDay(filteredTasks);
    const minTask = getMinTaskDay(filteredTasks);
    const mostImportantTask = getMostImportantTask(filteredTasks);
    const leastImportantTask = getLeastImportantTask(filteredTasks);

    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" align="center" padding="20px" fontWeight={"bold"}>
                Tasks
            </Typography>
            {/* Add Task Button */}
            <Link to="/add">
                <Button variant="contained" color="primary">Add Task</Button>
            </Link>
            <div style={{ marginBottom: '20px', marginTop: "20px" }}>
                {/* Priority Filter */}
                <select style={{ margin: '0 10px' }} onChange={(e) => setPriorityFilter(e.target.value)} value={priorityFilter}>
                    <option value="">Filter by Priority</option>
                    <option value="3">High</option>
                    <option value="2">Medium</option>
                    <option value="1">Low</option>
                </select>
                {/* Assigned Students Filter */}
                <div style={{ margin: '10px 0' }}>
                    Filter by Assigned Students:
                    {students.map((student) => (
                        <FormControlLabel
                            key={student.id}
                            control={
                                <Checkbox
                                    checked={selectedStudents.includes(String(student.id))}
                                    onChange={handleCheckboxChange}
                                    value={String(student.id)}
                                />
                            }
                            label={student.name}
                        />
                    ))}
                </div>
                {/* Date Range Filter */}
                <div style={{ margin: '10px 0' }}>
                    <input type="date" style={{ marginRight: '10px' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                {/* Search Bar */}
                <div style={{ margin: '10px 0' }}>
                    <input type="text" placeholder="Search by title or description" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </div>

            <div style={{ display: 'table', margin: 'auto' }}>
                <div style={{ display: 'table-header-group' }}>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>ID</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Title</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Description</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Due Date</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Priority</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Assigned Students</div>
                    <div style={{ display: 'table-cell', padding: '5px 10px', fontWeight: 'bold' }}>Actions</div>
                </div>
                {filteredTasks.map(task => (
                    <div key={task.id} style={{ display: 'table-row' }}>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{task.id}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{task.title}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{task.description}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{formatDueDate(task.due_date)}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>{task.assigned_students.map(student => student.name).join(', ')}</div>
                        <div style={{ display: 'table-cell', padding: '5px 10px' }}>
                            <Link to={`/edit/${task.id}`}><Button>Edit</Button></Link>
                            <Button onClick={() => handleDeleteTask(task.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ marginBottom: '20px' }}>
                {/* Display Statistics */}
                <Typography variant="h6" align="center" padding="10px" fontWeight={"bold"}>
                    Statistics:
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Day with Most Tasks: {maxTask.day} ({maxTask.count} tasks)
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Day with Least Tasks: {minTask.day} ({minTask.count} tasks)
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Average Priority: {calculateAveragePriority(filteredTasks).toFixed(2)}
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Average Students: {calculateAverageStudents(filteredTasks).toFixed(2)}
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Most Important Task: {mostImportantTask && `${mostImportantTask.title}, Due Date: ${mostImportantTask.dueDate.toLocaleString()}, Priority: ${mostImportantTask.priority === 3 ? 'High' : mostImportantTask.priority === 2 ? 'Medium' : 'Low'}`}
                </Typography>
                <Typography variant="body1" align="center" padding="5px">
                    Least Important Task: {leastImportantTask && `${leastImportantTask.title}, Due Date: ${leastImportantTask.dueDate.toLocaleString()}, Priority: ${leastImportantTask.priority === 3 ? 'High' : leastImportantTask.priority === 2 ? 'Medium' : 'Low'}`}
                </Typography>
            </div>
        </div>
    );
}

export default ViewTasks;

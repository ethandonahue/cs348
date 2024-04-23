import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
// import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

dayjs.extend(utc);
dayjs.extend(timezone);

function AddTask() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [priority, setPriority] = useState(3);
    const [students, setStudents] = useState([]);

    const priorityLabels = ["Low", "Medium", "High"];
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    useEffect(() => {
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
        fetchStudents();
    }, []);

    const handlePriorityChange = (event, newValue) => {
        setPriority(newValue);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleCheckboxChange = (event) => {
        const studentId = event.target.value;
        const isChecked = event.target.checked;

        setSelectedStudentIds(prevSelectedStudentIds => {
            const selectedStudentIds = [...prevSelectedStudentIds];
            const index = selectedStudentIds.indexOf(studentId);

            if (isChecked && index === -1) {
                selectedStudentIds.push(studentId);
            } else if (!isChecked && index !== -1) {
                selectedStudentIds.splice(index, 1);
            }
            return selectedStudentIds;
        });
    };





    const handleAddTask = async () => {
        const taskData = {
            title: title,
            description: description,
            dueDate: selectedDate,
            priority: priority,
            studentIds: selectedStudentIds // Pass selected student IDs
        };

        try {
            const response = await fetch('https://cs348.vercel.app/addTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            });

            if (!response.ok) {
                throw new Error('Failed to add task');
            }

            window.location.href = "/";
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" align="center" padding="20px" fontWeight={"bold"}>
                Add a Task
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '0 10px' }}>
                    <Typography variant="h6" align="center" padding="10px">
                        Title
                    </Typography>
                    <TextField
                        label="Title"
                        variant="outlined"
                        width="50px"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '0 10px' }}>
                    <Typography variant="h6" align="center" padding="10px">
                        Description
                    </Typography>
                    <TextField
                        variant="outlined"
                        multiline={true}
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '0 10px' }}>
                    <Typography variant="h6" align="center" padding="20px">
                        Select Due Date
                    </Typography>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateTimePicker
                            label="Due date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            timezone="America/New_York"
                        />
                    </LocalizationProvider>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '0 10px' }}>
                    <Typography variant="h6" align="center" padding="10px">
                        Priority
                    </Typography>
                    <Slider
                        aria-label="Custom marks"
                        value={priority}
                        onChange={handlePriorityChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(value) => priorityLabels[value - 1]}
                        min={1}
                        max={3}
                        step={1}
                        marks
                        sx={{ width: '200px' }}
                    />
                </div>
            </div>
            <Typography variant="h6" align="center" padding="10px">
                Assign task
            </Typography>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{ margin: '0 10px' }}>
                    {students.map((student) => (
                        <FormControlLabel
                            key={student.id}
                            control={
                                <Checkbox
                                    checked={selectedStudentIds.includes(String(student.id))}
                                    onChange={handleCheckboxChange}
                                    value={String(student.id)}
                                />
                            }
                            label={student.name}
                        />
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: "20px" }}>
                <div style={{ margin: '0 10px' }}>
                    <Button variant="contained" onClick={handleAddTask}>Add Task</Button>
                </div>
            </div>
        </div>
    );
}

export default AddTask;

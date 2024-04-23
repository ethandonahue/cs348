// EditTask.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import 'react-datepicker/dist/react-datepicker.css';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

dayjs.extend(utc);
dayjs.extend(timezone);

function EditTask() {
    const { taskId } = useParams();
    const [task, setTask] = useState(null);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [editedDate, setEditedDate] = useState(null);
    const [editedPriority, setEditedPriority] = useState(3);
    const [students, setStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);

    const priorityLabels = ["Low", "Medium", "High"];

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await fetch(`http://localhost:9000/getTask/${taskId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch task');
                }
                const fetchedTask = await response.json();
                setTask(fetchedTask);
                setEditedTitle(fetchedTask.title);
                setEditedDescription(fetchedTask.description);
                setEditedPriority(fetchedTask.priority);
                // setSelectedStudentIds(fetchedTask.assigned_students);
            } catch (error) {
                console.error('Error fetching task:', error);
            }
        };
        fetchTask();

        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:9000/getStudents');
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
    }, [taskId]);

    const handleTitleChange = (event) => {
        setEditedTitle(event.target.value);
    };

    const handleDescriptionChange = (event) => {
        setEditedDescription(event.target.value);
    };

    const handleDateChange = (date) => {
        setEditedDate(date);
    };

    const handlePriorityChange = (event, newValue) => {
        setEditedPriority(newValue);
    };

    const handleCheckboxChange = (event) => {
        const studentId = event.target.value;
        const isChecked = event.target.checked;

        setSelectedStudentIds((prevSelectedStudentIds) => {
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

    const handleSaveChanges = async () => {
        try {
            const taskData = {
                title: editedTitle,
                description: editedDescription,
                dueDate: editedDate,
                priority: editedPriority,
                studentIds: selectedStudentIds,
            };

            const response = await fetch(`http://localhost:9000/editTask/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(taskData),
            });

            if (!response.ok) {
                throw new Error('Failed to save changes');
            }

            window.location.href = "/";
            // Optionally, handle success, e.g., redirect user to task list
        } catch (error) {
            console.error('Error saving changes:', error);
        }
    };


    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" align="center" padding="20px" fontWeight="bold">
                Edit Task
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
                        value={editedTitle}
                        onChange={handleTitleChange}
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
                        value={editedDescription}
                        onChange={handleDescriptionChange}
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
                            value={editedDate}
                            onChange={handleDateChange}
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
                        value={editedPriority}
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
                            control={<Checkbox checked={selectedStudentIds.includes(String(student.id))} onChange={handleCheckboxChange} value={String(student.id)} />}
                            label={student.name}
                        />
                    ))}
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '20px' }}>
                <div style={{ margin: '0 10px' }}>
                    <Button variant="contained" onClick={handleSaveChanges}>
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default EditTask;

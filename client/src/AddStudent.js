import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';

function AddStudent() {
    const [students, setStudents] = useState([]);
    const [newStudentName, setNewStudentName] = useState('');

    const handleInputChange = (event) => {
        setNewStudentName(event.target.value);
    };

    const handleAddStudent = async () => {
        if (newStudentName.trim() !== '') {
            const newStudent = {
                name: newStudentName.trim()
            };

            try {
                const response = await fetch('http://localhost:9000/addStudent', { // Update the port to match your backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newStudent)
                });

                if (!response.ok) {
                    throw new Error('Failed to add student');
                }

                const responseData = await response.json();
                setStudents([...students, responseData]); // Assuming the backend returns the added student
                setNewStudentName('');
            } catch (error) {
                console.error('Error adding student:', error);
            }
        }
    };

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await fetch('http://localhost:9000/getStudents'); // Update the port to match your backend
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
    }, []); // Empty dependency array to ensure useEffect runs only once

    return (
        <div style={{ textAlign: 'center' }}>
            <Typography variant="h5" align="center" padding="20px" fontWeight="bold">
                Add a Student
            </Typography>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "150px"}}>
                <TextField
                    label="Student Name"
                    variant="outlined"
                    value={newStudentName}
                    onChange={handleInputChange}
                    style={{ marginBottom: '20px' }}
                />
                <Button variant="contained" onClick={handleAddStudent}>
                    Add Student
                </Button>
            </div>
            <div style={{ marginTop: '20px' }}>
                <Typography variant="h6">Current Students:</Typography>
                <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
                    {students.map((student) => (
                        <li key={student.id} style={{ marginBottom: '10px' }}>{student.name}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AddStudent;

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AddTask from './AddTask';
import ViewTasks from './ViewTasks';
import AddStudent from './AddStudent';
import EditTask from './EditTask';


function App() {
  return (
    <div style={{ textAlign: 'center' }}>
      <Typography variant="h3" align="center" padding="20px" fontWeight={"bold"}>
        Manage your tasks
      </Typography>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', width: "250px", justifyContent: "space-between" }}>
          <Button variant="contained" href="/" style={{ width: "100px" }}>Tasks</Button>
          <Button variant="contained" href="/addStudent" style={{ width: "100px" }}>Students</Button>
        </div>

      </div>
      <Router>
        <Routes>
          <Route path="/" element={<ViewTasks />} />
          <Route path="/add" element={<AddTask />} />
          <Route path="/addStudent" element={<AddStudent />} />
          <Route path="/edit/:taskId" element={<EditTask />} />
        </Routes>
      </Router>
    </div>

  );
}

export default App;
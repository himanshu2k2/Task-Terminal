import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import '../styles/taskManager.css';

const TaskManager = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
    });
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const username = localStorage.getItem('username');

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${config.API_URL}/api/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleInputChange = (e) => {
        setNewTask({
            ...newTask,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${config.API_URL}/api/tasks`, newTask, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNewTask({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: ''
            });
            fetchTasks();
        } catch (error) {
            console.error('Error creating task:', error);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${config.API_URL}/api/tasks/${taskId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        navigate('/login');
    };

    const filteredTasks = tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'active') return !task.completed;
        return true;
    });

    const handleToggleComplete = async (taskId) => {
        try {
            const task = tasks.find(t => t._id === taskId);
            const token = localStorage.getItem('token');
            await axios.put(`${config.API_URL}/api/tasks/${taskId}`, 
                { completed: !task.completed },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <div className="task-manager">
            <div className="task-header">
                <h1>Task Manager</h1>
                <div className="user-controls">
                    <span className="username">Welcome, {username}!</span>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>

            <div className="task-content">
                <div className="task-section">
                    <h2 className="section-header">Add New Task</h2>
                    <form onSubmit={handleSubmit} className="task-form">
                        <div className="form-row">
                            <label htmlFor="title">Title</label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                value={newTask.title}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter task title"
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                value={newTask.description}
                                onChange={handleInputChange}
                                placeholder="Enter task description"
                                rows="3"
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={newTask.priority}
                                onChange={handleInputChange}
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label htmlFor="dueDate">Due Date</label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={newTask.dueDate}
                                onChange={handleInputChange}
                            />
                        </div>
                        <button type="submit" className="add-task-button">
                            Add Task
                        </button>
                    </form>
                </div>

                <div className="task-section">
                    <h2 className="section-header">Tasks</h2>
                    <div className="task-filters">
                        <button
                            className={`filter-button ${filter === 'all' ? 'active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            All
                        </button>
                        <button
                            className={`filter-button ${filter === 'active' ? 'active' : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Active
                        </button>
                        <button
                            className={`filter-button ${filter === 'completed' ? 'active' : ''}`}
                            onClick={() => setFilter('completed')}
                        >
                            Completed
                        </button>
                    </div>
                    <div className="task-list">
                        {filteredTasks.map(task => (
                            <div 
                                key={task._id} 
                                className={`task-item ${task.completed ? 'completed' : ''}`}
                            >
                                <div className="task-title">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => handleToggleComplete(task._id)}
                                    />
                                    <span style={{ 
                                        textDecoration: task.completed ? 'line-through' : 'none',
                                        marginLeft: '8px'
                                    }}>
                                        {task.title}
                                    </span>
                                </div>
                                <p className="task-description">{task.description}</p>
                                <div className="task-meta">
                                    <span className={`task-priority priority-${task.priority}`}>
                                        {task.priority}
                                    </span>
                                    {task.dueDate && (
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                                <div className="task-actions">
                                    <button
                                        className="task-button delete-button"
                                        onClick={() => handleDelete(task._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskManager;

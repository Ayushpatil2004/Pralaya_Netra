import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const AdminDashboard = () => {
    const { backendUrl, isLoggedin, userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalUsers: 0, totalVerified: 0, pendingApproval: 0, usersToday: 0 });
    const [users, setUsers] = useState([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [sendToUnverified, setSendToUnverified] = useState(false);
    
    // Fetch data
    const fetchAdminData = async () => {
        try {
            axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
            const [statsRes, usersRes] = await Promise.all([
                axios.get(`${backendUrl}/api/admin/stats`),
                axios.get(`${backendUrl}/api/admin/users`)
            ]);

            if (statsRes.data.success) setStats(statsRes.data.stats);
            if (usersRes.data.success) setUsers(usersRes.data.users);
        } catch (error) {
            toast.error('Failed to load admin data');
        }
    };

    // Protect route
    useEffect(() => {
        if (!isLoggedin) {
            navigate('/login');
            return;
        }
        if (userData && userData.role !== 'admin') {
            toast.error("Unauthorized! Admins only.");
            navigate('/');
            return;
        }
        
        if (userData && userData.role === 'admin') {
            fetchAdminData();
        }
    }, [isLoggedin, userData, navigate]);

    const handleApprove = async (id) => {
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/approve`, { id });
            if (data.success) {
                toast.success(data.message);
                fetchAdminData();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/delete`, { id });
            if (data.success) {
                toast.success(data.message);
                fetchAdminData();
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${backendUrl}/api/admin/broadcast`, { subject, message, sendToUnverified });
            if (data.success) {
                toast.success(data.message);
                setSubject('');
                setMessage('');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (!userData || userData.role !== 'admin') return <div className="min-h-screen"></div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-10 mt-10 sm:mt-0">
                <img 
                    onClick={() => navigate("/")}
                    src={assets.pralaya_netra} 
                    alt="Pralaya Netra" 
                    className="w-24 sm:w-32 cursor-pointer object-contain" 
                />
                <h1 className="text-2xl sm:text-3xl font-bold text-indigo-400">Admin Control Center</h1>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700">
                    <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Total Registered Users</h3>
                    <p className="text-4xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow border border-yellow-700/50">
                    <h3 className="text-yellow-400 text-sm uppercase tracking-wider mb-2">Pending Admin Approval</h3>
                    <p className="text-4xl font-bold text-yellow-300">{stats.pendingApproval}</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700">
                    <h3 className="text-slate-400 text-sm uppercase tracking-wider mb-2">Accounts Created Today</h3>
                    <p className="text-4xl font-bold text-indigo-300">{stats.usersToday}</p>
                </div>
            </div>

            {/* Broadcast Email Form */}
            <div className="bg-slate-800 p-6 rounded-lg shadow border border-slate-700 mb-10">
                <h2 className="text-xl font-semibold mb-4 text-indigo-300">Broadcast Message</h2>
                <form onSubmit={handleBroadcast} className="flex flex-col gap-4">
                    <input 
                        type="text" 
                        placeholder="Email Subject" 
                        required 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="p-3 bg-slate-900 rounded outline-none border border-slate-700 focus:border-indigo-500 transition-colors"
                    />
                    <textarea 
                        rows="4" 
                        placeholder="Type your message to all users here..." 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="p-3 bg-slate-900 rounded outline-none border border-slate-700 focus:border-indigo-500 transition-colors"
                    ></textarea>
                    
                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="unverified" 
                            checked={sendToUnverified} 
                            onChange={(e) => setSendToUnverified(e.target.checked)} 
                            className="w-4 h-4"
                        />
                        <label htmlFor="unverified" className="text-sm text-slate-300">
                            Send ONLY to explicitly Unverified Users (for reminders) instead of Verified Users.
                        </label>
                    </div>

                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded transition-colors self-start px-8">
                        Send Global Broadcast
                    </button>
                </form>
            </div>

            {/* User Management Table */}
            <div className="bg-slate-800 rounded-lg shadow border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700">
                    <h2 className="text-xl font-semibold text-indigo-300">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/50 text-slate-300">
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap">Name</th>
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap">Email</th>
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap text-center">Email Verified</th>
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap text-center">Admin Approved</th>
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap text-center">Role</th>
                                <th className="p-4 border-b border-slate-700 font-medium whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 border-b border-slate-700 capitalize">{user.name}</td>
                                    <td className="p-4 border-b border-slate-700 text-slate-300">{user.email}</td>
                                    <td className="p-4 border-b border-slate-700 text-center">
                                        {user.isAccountVerified 
                                            ? <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-semibold">Yes</span> 
                                            : <span className="bg-red-900/50 text-red-400 px-2 py-1 rounded text-xs font-semibold">No</span>}
                                    </td>
                                    <td className="p-4 border-b border-slate-700 text-center">
                                        {user.isAdminApproved 
                                            ? <span className="bg-green-900/50 text-green-400 px-2 py-1 rounded text-xs font-semibold">Approved</span> 
                                            : <span className="bg-yellow-900/50 text-yellow-500 px-2 py-1 rounded text-xs font-semibold">Pending</span>}
                                    </td>
                                    <td className="p-4 border-b border-slate-700 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${user.role === 'admin' ? 'bg-indigo-900/50 text-indigo-400' : 'bg-slate-700 text-slate-300'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 border-b border-slate-700 text-right flex justify-end gap-2">
                                        {!user.isAdminApproved && user.isAccountVerified && (
                                            <button 
                                                onClick={() => handleApprove(user._id)} 
                                                className="bg-green-600 hover:bg-green-500 text-white text-xs py-1 px-3 rounded transition-colors"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {user.role !== 'admin' && (
                                            <button 
                                                onClick={() => handleDelete(user._id)} 
                                                className="bg-red-600 hover:bg-red-500 text-white text-xs py-1 px-3 rounded transition-colors"
                                            >
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-slate-400">Loading user database...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

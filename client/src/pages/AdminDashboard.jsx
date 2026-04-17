import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const AdminDashboard = () => {
    const { backendUrl, isLoggedin, userData } = useContext(AppContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('dashboard');
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

    const navItemClass = (tab) => `
        w-full text-left px-6 py-4 transition-colors text-sm uppercase tracking-wide cursor-pointer font-semibold
        ${activeTab === tab ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-l-4 border-transparent'}
    `;

    // Filter out users who have the role "admin"
    const filteredUsers = users.filter(user => user.role !== 'admin');

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row relative">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-40">
                <div 
                    className="absolute inset-0 w-full h-full animate-floating-bg blue-tint-filter"
                    style={{ backgroundImage: `url(${assets.Animatedbg})`, backgroundRepeat: 'no-repeat' }}
                ></div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-slate-900/80 backdrop-blur-md border-b md:border-r border-slate-700/50 flex flex-col pt-6 z-10 shrink-0 shadow-lg">
                <div className="px-6 mb-8 flex flex-col items-center md:items-start gap-2">
                    <img 
                        onClick={() => navigate("/")}
                        src={assets.pralaya_netra} 
                        alt="Pralaya Netra" 
                        className="w-20 cursor-pointer object-contain" 
                    />
                    <h2 className="text-2xl font-bold text-white hidden md:block">Admin <span className="text-indigo-400">Portal</span></h2>
                </div>
                
                <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-hidden">
                    <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
                        Global Stats
                    </button>
                    <button onClick={() => setActiveTab('users')} className={navItemClass('users')}>
                        User Access
                    </button>
                    <button onClick={() => setActiveTab('broadcast')} className={navItemClass('broadcast')}>
                        Broadcast Mail
                    </button>
                    <div className="mt-auto hidden md:block">
                        <button onClick={() => navigate("/")} className="w-full text-left px-6 py-6 text-slate-400 hover:text-white transition-colors cursor-pointer border-t border-slate-800 font-medium">
                            ← Return to App
                        </button>
                    </div>
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-4 md:p-10 text-white z-10 overflow-y-auto max-h-screen">
                <div className="max-w-6xl mx-auto space-y-8">
                
                    {/* View: Dashboard Stats */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-semibold mb-6">Global Statistics</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-xl shadow-lg">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Total Registered Users</h3>
                                    <p className="text-5xl font-black text-white">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-xl shadow-lg">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Pending Map Approvals</h3>
                                    <p className="text-5xl font-black text-yellow-300">{stats.pendingApproval}</p>
                                </div>
                                <div className="bg-slate-800/80 backdrop-blur border border-slate-700/50 p-6 rounded-xl shadow-lg">
                                    <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-2">Daily Signups</h3>
                                    <p className="text-5xl font-black text-green-300">{stats.usersToday}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Broadcast Email */}
                    {activeTab === 'broadcast' && (
                        <div className="animate-fade-in w-full max-w-3xl">
                            <h2 className="text-2xl font-semibold mb-6">Mass Communications</h2>
                            <div className="bg-slate-800/80 backdrop-blur p-6 md:p-8 rounded-xl shadow-lg border border-slate-700/50">
                                <p className="text-slate-400 mb-6 text-sm">Send a notification email directly to the registered userbase via the integrated API.</p>
                                <form onSubmit={handleBroadcast} className="flex flex-col gap-5">
                                    <input 
                                        type="text" 
                                        placeholder="Email Subject" 
                                        required 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="p-4 bg-slate-900/90 rounded outline-none border border-slate-700 focus:border-indigo-500 transition-colors placeholder:text-slate-500"
                                    />
                                    <textarea 
                                        rows="6" 
                                        placeholder="Type your message to all users here..." 
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="p-4 bg-slate-900/90 rounded outline-none border border-slate-700 focus:border-indigo-500 transition-colors placeholder:text-slate-500 resize-none"
                                    ></textarea>
                                    
                                    <label className="flex items-center gap-3 mt-2 cursor-pointer w-max">
                                        <input 
                                            type="checkbox" 
                                            checked={sendToUnverified} 
                                            onChange={(e) => setSendToUnverified(e.target.checked)} 
                                            className="w-5 h-5 rounded border-slate-600 cursor-pointer accent-indigo-600"
                                        />
                                        <span className="text-sm text-slate-300 select-none">
                                            Send ONLY to strictly Unverified Users (for engagement reminders)
                                        </span>
                                    </label>

                                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 mt-4 rounded-lg shadow-md transition-colors w-full cursor-pointer">
                                        Deploy Global Broadcast
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* View: User Management */}
                    {activeTab === 'users' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-semibold mb-6">User Database & Access Control</h2>
                            <div className="bg-slate-800/80 backdrop-blur rounded-xl shadow border border-slate-700/50 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                                                <th className="p-5 font-semibold whitespace-nowrap hidden sm:table-cell">Name</th>
                                                <th className="p-5 font-semibold whitespace-nowrap">Email Address</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-center">Verified?</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-center">Map Access</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-700/50">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-slate-700/30 transition-colors group">
                                                    <td className="p-5 capitalize font-medium hidden sm:table-cell">{user.name}</td>
                                                    <td className="p-5 text-slate-300">{user.email}</td>
                                                    <td className="p-5 text-center">
                                                        {user.isAccountVerified 
                                                            ? <span className="bg-slate-900 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">True</span> 
                                                            : <span className="bg-slate-900 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">False</span>}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {user.isAdminApproved 
                                                            ? <span className="bg-slate-900 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm">Approved</span> 
                                                            : <span className="bg-yellow-900/20 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm animate-pulse">Pending...</span>}
                                                    </td>
                                                    <td className="p-5 text-right flex justify-end gap-3">
                                                        {!user.isAdminApproved && user.isAccountVerified && (
                                                            <button 
                                                                onClick={() => handleApprove(user._id)} 
                                                                className="bg-green-600/90 hover:bg-green-500 text-white font-semibold text-xs py-1.5 px-4 rounded transition-colors shadow cursor-pointer focus:ring-2 ring-green-400 focus:outline-none"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDelete(user._id)} 
                                                            className="bg-red-900/80 hover:bg-red-600 text-red-200 hover:text-white font-semibold text-xs py-1.5 px-4 rounded transition-all shadow cursor-pointer focus:ring-2 ring-red-400 focus:outline-none"
                                                        >
                                                            Revoke User
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center text-slate-500 italic">No standard users actively registered in the database.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

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
        w-full text-left px-6 py-4 transition-colors text-sm uppercase tracking-wide cursor-pointer font-semibold flex items-center gap-3
        ${activeTab === tab ? 'bg-cyan-900/30 text-cyan-400 border-l-4 border-cyan-400' : 'text-blue-300 hover:bg-blue-900/50 hover:text-white border-l-4 border-transparent'}
    `;

    // Filter out users who have the role "admin"
    const filteredUsers = users.filter(user => user.role !== 'admin');

    return (
        <div className="min-h-screen bg-blue-950 flex flex-col md:flex-row relative">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-50">
                <div 
                    className="absolute inset-0 w-full h-full animate-floating-bg blue-tint-filter"
                    style={{ backgroundImage: `url(${assets.Animatedbg})`, backgroundRepeat: 'no-repeat' }}
                ></div>
            </div>

            {/* Sidebar */}
            <div className="w-full md:w-64 bg-blue-950/80 backdrop-blur-md border-b md:border-r border-blue-800/60 flex flex-col pt-6 z-10 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
                <div className="px-6 mb-8 flex flex-col items-center md:items-start gap-3">
                    <img 
                        onClick={() => navigate("/")}
                        src={assets.pralaya_netra} 
                        alt="Pralaya Netra" 
                        className="w-20 cursor-pointer object-contain filter drop-shadow-md" 
                    />
                    <h2 className="text-2xl font-bold text-white hidden md:block">Admin <span className="text-cyan-400">Portal</span></h2>
                </div>
                
                <nav className="flex-1 flex flex-row md:flex-col overflow-x-auto md:overflow-hidden mt-2">
                    <button onClick={() => setActiveTab('dashboard')} className={navItemClass('dashboard')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Global Stats
                    </button>
                    <button onClick={() => setActiveTab('users')} className={navItemClass('users')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        User Access
                    </button>
                    <button onClick={() => setActiveTab('broadcast')} className={navItemClass('broadcast')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Broadcast Mail
                    </button>
                    <div className="mt-auto hidden md:block p-6 border-t border-blue-800/60">
                        <button 
                            onClick={() => navigate("/")} 
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-blue-900/40 hover:bg-cyan-500/10 text-blue-300 hover:text-cyan-300 transition-all border border-blue-800/50 hover:border-cyan-500/30 font-semibold group cursor-pointer"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Return to App
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
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-cyan-400 rounded-sm"></span> Global Statistics</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-blue-900/60 backdrop-blur border border-blue-800/60 p-6 rounded-xl shadow-lg ring-1 ring-white/5">
                                    <h3 className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">Total Registered Users</h3>
                                    <p className="text-5xl font-black text-white drop-shadow">{stats.totalUsers}</p>
                                </div>
                                <div className="bg-blue-900/60 backdrop-blur border border-yellow-500/30 p-6 rounded-xl shadow-lg ring-1 ring-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                                    <h3 className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">Pending Dashboard Approvals</h3>
                                    <p className="text-5xl font-black text-yellow-300 drop-shadow relative z-10">{stats.pendingApproval}</p>
                                </div>
                                <div className="bg-blue-900/60 backdrop-blur border border-emerald-500/30 p-6 rounded-xl shadow-lg ring-1 ring-white/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                                    <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">New Accounts Today</h3>
                                    <p className="text-5xl font-black text-emerald-300 drop-shadow relative z-10">{stats.usersToday}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Broadcast Email */}
                    {activeTab === 'broadcast' && (
                        <div className="animate-fade-in w-full max-w-3xl">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-cyan-400 rounded-sm"></span> Mass Communications</h2>
                            <div className="bg-blue-900/60 backdrop-blur p-6 md:p-8 rounded-xl shadow-lg border border-blue-800/60 ring-1 ring-white/5">
                                <p className="text-blue-200 mb-6 text-sm">Send a notification email directly to the registered userbase via the integrated API.</p>
                                <form onSubmit={handleBroadcast} className="flex flex-col gap-5">
                                    <input 
                                        type="text" 
                                        placeholder="Email Subject" 
                                        required 
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="p-4 bg-blue-950 rounded-lg outline-none border border-blue-700/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-blue-400/50 shadow-inner"
                                    />
                                    <textarea 
                                        rows="6" 
                                        placeholder="Type your message to all users here..." 
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="p-4 bg-blue-950 rounded-lg outline-none border border-blue-700/50 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all placeholder:text-blue-400/50 resize-none shadow-inner"
                                    ></textarea>
                                    
                                    <label className="flex items-center gap-3 mt-2 cursor-pointer w-max group">
                                        <input 
                                            type="checkbox" 
                                            checked={sendToUnverified} 
                                            onChange={(e) => setSendToUnverified(e.target.checked)} 
                                            className="w-5 h-5 rounded border-blue-border-600 bg-blue-950 cursor-pointer accent-cyan-500"
                                        />
                                        <span className="text-sm text-blue-200 select-none group-hover:text-white transition-colors">
                                            Send ONLY to strictly Unverified Users (for engagement reminders)
                                        </span>
                                    </label>

                                    <button className="bg-blue-600 hover:bg-cyan-500 text-white font-bold py-4 mt-4 rounded-lg shadow-[0_0_15px_rgba(6,-182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,-182,212,0.5)] transition-all w-full cursor-pointer uppercase tracking-wideset border border-blue-500 hover:border-cyan-300">
                                        Deploy Global Broadcast
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* View: User Management */}
                    {activeTab === 'users' && (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2"><span className="w-2 h-6 bg-cyan-400 rounded-sm"></span> User Database & Access Control</h2>
                            <div className="bg-blue-900/60 backdrop-blur rounded-xl shadow-lg border border-blue-800/60 ring-1 ring-white/5 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-blue-950 text-blue-300 text-xs uppercase tracking-wider border-b border-blue-800/60">
                                                <th className="p-5 font-semibold whitespace-nowrap hidden sm:table-cell">Name</th>
                                                <th className="p-5 font-semibold whitespace-nowrap">Email Address</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-center">Verified?</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-center">Dashboard Access</th>
                                                <th className="p-5 font-semibold whitespace-nowrap text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-blue-800/40">
                                            {filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-blue-800/40 transition-colors group">
                                                    <td className="p-5 capitalize font-medium hidden sm:table-cell text-white">{user.name}</td>
                                                    <td className="p-5 text-blue-200">{user.email}</td>
                                                    <td className="p-5 text-center">
                                                        {user.isAccountVerified 
                                                            ? <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-block">True</span> 
                                                            : <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-block">False</span>}
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        {user.isAdminApproved 
                                                            ? <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(34,211,238,0.2)] inline-block">Approved</span> 
                                                            : <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-sm inline-block animate-pulse">Pending...</span>}
                                                    </td>
                                                    <td className="p-5 text-right flex justify-end gap-3 opacity-100 transition-opacity">
                                                        {!user.isAdminApproved && user.isAccountVerified && (
                                                            <button 
                                                                onClick={() => handleApprove(user._id)} 
                                                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-1.5 px-4 rounded transition-all shadow-md hover:shadow-lg cursor-pointer focus:ring-2 ring-emerald-400 focus:outline-none border border-emerald-500"
                                                            >
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDelete(user._id)} 
                                                            className="bg-red-950/80 hover:bg-red-600 text-red-300 hover:text-white font-semibold text-xs py-1.5 px-4 rounded transition-all shadow-md hover:shadow-lg cursor-pointer focus:ring-2 ring-red-400 focus:outline-none border border-red-800/50 hover:border-red-500"
                                                        >
                                                            Revoke User
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center text-blue-400/60 italic">No standard users actively registered in the database.</td>
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

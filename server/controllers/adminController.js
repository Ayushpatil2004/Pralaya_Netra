import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

// Get high-level statistics for the dashboard
export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments();
        const totalVerified = await userModel.countDocuments({ isAccountVerified: true });
        const pendingApproval = await userModel.countDocuments({ isAccountVerified: true, isAdminApproved: false });
        
        // Count users created today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const usersToday = await userModel.countDocuments({ createdAt: { $gte: startOfDay } });

        res.json({
            success: true,
            stats: { totalUsers, totalVerified, pendingApproval, usersToday }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Retrieve all users for the table
export const getAllUsers = async (req, res) => {
    try {
        // Exclude the password field and select everything else
        const users = await userModel.find().select('-password').sort({ createdAt: -1 });
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Approve a user for PowerBI access
export const approveUser = async (req, res) => {
    const { id } = req.body;
    try {
        const user = await userModel.findById(id);
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        user.isAdminApproved = true;
        await user.save();
        res.json({ success: true, message: 'User successfully approved for Power BI access' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete a user entirely
export const deleteUser = async (req, res) => {
    const { id } = req.body;
    try {
        await userModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'User deleted securely' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Broadcast an email to everyone
export const broadcastEmail = async (req, res) => {
    const { subject, message, sendToUnverified } = req.body;
    
    if (!subject || !message) {
        return res.json({ success: false, message: 'Subject and message are required' });
    }

    try {
        // Find users based on targeted group
        const query = sendToUnverified ? {} : { isAccountVerified: true };
        const users = await userModel.find(query).select('email name');

        if (users.length === 0) {
            return res.json({ success: false, message: 'No users found matching the criteria.' });
        }

        let sentCount = 0;
        let failCount = 0;

        // Note: Brevo has batch endpoints, but we loop here securely for simplicity
        for (const user of users) {
             try {
                const mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: user.email,
                    subject: subject,
                    text: `Hello ${user.name},\n\n${message}\n\n- Pralaya Netra Admin`,
                    html: `<h3>Hello ${user.name},</h3><p>${message.replace(/\n/g, '<br/>')}</p><br/><small>- Pralaya Netra System</small>`
                };
                await transporter.sendMail(mailOptions);
                sentCount++;
             } catch(err) {
                console.error('Failed sending to ', user.email);
                failCount++;
             }
        }

        res.json({ success: true, message: `Broadcast Complete! Sent to ${sentCount} users, Failed: ${failCount}.` });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

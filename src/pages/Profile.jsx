import { useState } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ShieldCheck, 
  Camera, 
  Save, 
  Copy, 
  Check 
} from "lucide-react";
import { motion } from "motion/react";
import { message } from "antd";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const Profile = () => {
  // --- Profile State ---
  const [profileData, setProfileData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@greypools.io",
    phone: "+234 803 123 4567",
    role: "System Administrator",
    department: "Operations & Treasury",
    location: "Abuja, Nigeria",
    adminId: "GP-ADM-2026-084"
  });

  const [copied, setCopied] = useState(false);

  // --- Handlers ---
  const handleCopyId = () => {
    navigator.clipboard.writeText(profileData.adminId);
    setCopied(true);
    message.success("Admin Reference ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    message.success("Administrative profile attributes updated successfully.");
  };

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF] p-6">
      
      {/* Page Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-white">
          <User size={22} className="text-[#34D399]" />
          <h1 className="text-2xl font-bold tracking-tight">Administrative Profile</h1>
        </div>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Manage your identity parameters, node permissions, and contact records.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* COLUMN 1: Profile Badge & Security Clearence Summary */}
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          animate="visible"
          className="border border-slate-800 bg-[#1F2937] p-6 rounded-none space-y-6 text-center"
        >
          {/* Avatar Area */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="w-full h-full rounded-full bg-[#090A0F] border-2 border-slate-800 flex items-center justify-center font-bold text-[#34D399] text-3xl select-none shadow-inner">
              {profileData.firstName[0]}{profileData.lastName[0]}
            </div>
            <button className="absolute bottom-0 right-0 p-1.5 bg-[#3B82F6] hover:bg-blue-600 text-white rounded-full transition-colors border-2 border-[#1F2937]">
              <Camera size={14} />
            </button>
          </div>

          {/* Identity Titles */}
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{profileData.firstName} {profileData.lastName}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-[#090A0F] border border-slate-800 rounded-full text-[11px] font-mono font-semibold text-[#34D399]">
              <ShieldCheck size={12} /> {profileData.role}
            </div>
          </div>

          <hr className="border-slate-800" />

          {/* System Metadata Stats */}
          <div className="space-y-3 text-xs text-left font-mono">
            <div className="bg-[#090A0F] border border-slate-800 p-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-sans text-[11px] font-bold uppercase">Reference Base ID</span>
              <div className="flex items-center gap-2">
                <span className="text-white text-[11px]">{profileData.adminId}</span>
                <button onClick={handleCopyId} className="text-[#9CA3AF] hover:text-white transition-colors">
                  {copied ? <Check size={12} className="text-[#34D399]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-slate-500 font-sans text-[11px] font-bold uppercase block">Node Authority Cluster</span>
              <span className="text-white text-xs block font-sans font-semibold">{profileData.department}</span>
            </div>
          </div>
        </motion.div>

        {/* COLUMN 2 & 3: Detailed Information Form */}
        <div className="lg:col-span-2">
          <motion.div 
            variants={fadeInUp} 
            initial="hidden" 
            animate="visible"
            className="border border-slate-800 bg-[#1F2937] p-6 rounded-none space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Building size={18} className="text-[#34D399]" />
              <h3 className="font-bold text-white uppercase tracking-wider text-xs">Identity Registry & Communications</h3>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
              
              {/* Name Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block">Last Name</label>
                  <input 
                    type="text" 
                    required
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              {/* Email & Phone Contacts Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block flex items-center gap-1">
                    <Mail size={12} className="text-slate-500" /> Administrative Email Address
                  </label>
                  <input 
                    type="email" 
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block flex items-center gap-1">
                    <Phone size={12} className="text-slate-500" /> Secure Communications Line
                  </label>
                  <input 
                    type="text" 
                    required
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              {/* Department & Location Fields Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block flex items-center gap-1">
                    <Building size={12} className="text-slate-500" /> Core Node Assignment
                  </label>
                  <input 
                    type="text" 
                    disabled
                    value={profileData.department}
                    className="w-full px-3 py-2.5 bg-[#090A0F]/60 border border-slate-800/80 rounded-none font-semibold text-slate-500 cursor-not-allowed select-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-[#9CA3AF] block flex items-center gap-1">
                    <MapPin size={12} className="text-slate-500" /> Regional Node Location
                  </label>
                  <input 
                    type="text" 
                    required
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                  />
                </div>
              </div>

              {/* Action Submit */}
              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-xs px-5 py-2.5 rounded-none transition-colors"
                >
                  <Save size={14} /> Update Identity Schema
                </button>
              </div>

            </form>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
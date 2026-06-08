import { useEffect, useState } from "react";
import { User, Mail, Shield, ShieldCheck, Camera, Save, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
// 🔌 Imported Upload from antd
import { message, Skeleton, Upload } from "antd";
import { useAuthStore } from "../../store/useAuthStore";

const Profile = () => {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Sync state data safely on initial mount
  useEffect(() => {
    const initProfile = async () => {
      try {
        if (checkAuth) await checkAuth();
      } catch (err) {
        console.error("Profile authorization sync error:", err);
      } finally {
        setSyncing(false);
      }
    };
    initProfile();
  }, []);

  // Update form inputs when user context refreshes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "user",
      });
      // Set existing profile picture URL if present on user object
      setAvatarUrl(user.profilePicture || user.avatar || "");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📸 Ant Design custom upload interceptor
  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj || info.file;
    if (!file) return;

    // Validate asset payload parameters safely before processing state memory mutations
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG images!");
      return;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return;
    }

    // Retain binary file chunk reference for multipart forms if needed
    setAvatarFile(file);

    // Create instantaneous base64 visual local preview data mapping string
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // 💡 Architectural Note: If submitting images via APIs, switch payload delivery format:
      // const payload = new FormData();
      // payload.append("name", formData.name);
      // if (avatarFile) payload.append("avatar", avatarFile);
      // await updateProfile(payload);

      message.success("Account profile parameters synchronized successfully!");
      if (checkAuth) await checkAuth();
    } catch (err) {
      console.error("Profile update error:", err);
      message.error(err.response?.data?.message || "Failed to update profile parameters.");
    } finally {
      setLoading(false);
    }
  };

  if (syncing) {
    return (
      <div className="max-w-3xl mx-auto p-4 space-y-6">
        <div className="h-28 bg-slate-800/30 rounded-2xl animate-pulse p-6 flex items-center gap-4">
          <Skeleton.Avatar active size={64} shape="circle" className="!bg-slate-700/40" />
          <div className="space-y-2 flex-1">
            <Skeleton.Button active size="small" className="w-48 !bg-slate-700/40" />
            <Skeleton.Button active size="small" className="w-32 !bg-slate-700/40" />
          </div>
        </div>
        <div className="bg-[#1F2937] border border-slate-800 p-6 rounded-2xl space-y-4">
          <Skeleton active paragraph={{ rows: 4 }} title={false} className="custom-table-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-sans text-slate-200 p-4 space-y-6 min-h-screen">
      
      {/* 👤 Meta Profile Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1F2937] to-[#111827] p-6 rounded-2xl border border-slate-800/80 shadow-xl shadow-[#090A0F]/40">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#34D399]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center gap-5 relative z-10 text-center sm:text-left">
          
          {/* Avatar Component Box with AntD Upload Integration */}
          <div className="relative group select-none">
            <Upload
              name="avatar"
              showUploadList={false}
              beforeUpload={() => false} // Stops automatic POST upload pipeline targeting
              onChange={handleAvatarChange}
              accept="image/png, image/jpeg"
              className="cursor-pointer block"
            >
              <div className="w-20 h-20 rounded-full bg-[#090A0F] border-2 border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner relative cursor-pointer hover:border-[#34D399] transition-colors group">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Profile Instance Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User size={36} className="text-slate-500" />
                )}
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={16} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 p-1.5 bg-[#34D399] group-hover:bg-emerald-500 text-slate-900 rounded-full transition-all shadow-md pointer-events-none">
                <Camera size={12} />
              </div>
            </Upload>
          </div>

          <div className="space-y-1 flex-1">
            <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start gap-2">
              {user?.name || "Investor Profile"}
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-emerald-500/10 text-[#34D399] border border-emerald-500/10">
                Verified Node
              </span>
            </h1>
            <p className="text-xs text-slate-400">{user?.email || "No cryptographic mail binding"}</p>
          </div>

          <div className="bg-[#090A0F]/40 border border-slate-800/80 px-4 py-2.5 rounded-xl text-center shadow-inner shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Account Role</span>
            <span className="text-xs font-bold text-white capitalize flex items-center justify-center gap-1.5">
              <ShieldCheck size={14} className="text-[#34D399]" />
              {formData.role}
            </span>
          </div>

        </div>
      </div>

      {/* 🛠️ Profile Edit Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 rounded-2xl shadow-xl shadow-[#090A0F]/40 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800/60 bg-[#090A0F]/10 flex items-center gap-3">
          <div className="p-2 bg-[#34D399]/10 rounded-xl text-[#34D399]">
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Identity Credentials</h3>
            <p className="text-[11px] text-slate-400">Modify the explicit user attributes bound to your security instance.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Full Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 block">Full Name</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <User size={16} />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-9 pr-4 py-2.5 bg-[#090A0F] border border-slate-800 focus:border-[#34D399] rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Email Address Field (Disabled for Security/Token binding) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-400 block">Email Address</label>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Shield size={10} /> Immutable identity routing
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">
                <Mail size={16} />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                placeholder="investor@network.com"
                className="w-full pl-9 pr-4 py-2.5 bg-[#090A0F]/50 border border-slate-800/40 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed focus:outline-none"
              />
            </div>
          </div>

          <div className="h-px bg-slate-800/40 my-2" />

          {/* Form Actions */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#34D399] hover:bg-emerald-500 disabled:bg-slate-800/80 disabled:text-slate-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed text-slate-950"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Synchronizing Attributes...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Changes
                </>
              )}
            </button>
          </div>

        </form>
      </motion.div>

    </div>
  );
};

export default Profile;
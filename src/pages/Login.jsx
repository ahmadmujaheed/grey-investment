import { Form, Input, Button, Checkbox } from "antd";
import { Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log(values);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased selection:bg-emerald-500/10 selection:text-emerald-700">
      {/* Left Side (Visual Panel) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <img
          src="/investment.jpg"
          alt="Investment growth illustration"
          className="w-full h-full object-cover"
        />

        {/* Elegant light-to-dark gradient overlay over the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-16">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-6xl font-bold text-white leading-tight tracking-tight">
              Invest today,
              <br />
              <span className="text-emerald-400 drop-shadow-sm">
                secure tomorrow.
              </span>
            </h1>

            <p className="mt-6 text-slate-200 text-lg max-w-md font-medium leading-relaxed">
              Grey Investment helps you grow your wealth with smart strategies
              and real insights.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side (Form Container) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Clean white card with a very soft, sophisticated shadow */}
          <div className="bg-white border border-slate-200/80 rounded-3xl p-10 shadow-xl shadow-slate-200/50">
            {/* Header / Logo */}
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight">
                Grey <span className="text-emerald-600">Investment</span>
              </h2>

              <p className="text-slate-500 mt-2 font-medium">
                Welcome back. Sign in to continue.
              </p>
            </div>

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              {/* Email Field */}
              <Form.Item
                label={
                  <span className="text-slate-700 font-semibold tracking-wide text-sm">
                    Email
                  </span>
                }
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                  {
                    required: true,
                    message: "Please enter email",
                  },
                ]}
              >
                <Input
                  size="large"
                  prefix={<Mail size={18} className="text-slate-400 mr-2" />}
                  placeholder="name@company.com"
                  className="h-12 !bg-slate-50 !border-slate-200 !text-slate-900 placeholder:!text-slate-400 hover:!border-emerald-500 focus:!border-emerald-500 focus:!shadow-[0_0_0_2px_rgba(16,185,129,0.15)] transition-all duration-200"
                />
              </Form.Item>

              {/* Password Field */}
              <Form.Item
                label={
                  <span className="text-slate-700 font-semibold tracking-wide text-sm">
                    Password
                  </span>
                }
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter password",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<Lock size={18} className="text-slate-400 mr-2" />}
                  placeholder="Enter password"
                  className="h-12 !bg-slate-50 !border-slate-200 !text-slate-900 placeholder:!text-slate-400 hover:!border-emerald-500 focus:!border-emerald-500 focus:!shadow-[0_0_0_2px_rgba(16,185,129,0.15)] transition-all duration-200"
                />
              </Form.Item>

              {/* Remember Me & Forgot Password Link */}
              <div className="flex justify-between items-center mb-8">
                <Checkbox className="text-slate-500 font-medium [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-emerald-600 [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-emerald-600 [&_.ant-checkbox-wrapper:hover_.ant-checkbox-inner]:!border-emerald-600">
                  Remember me
                </Checkbox>

                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold transition-colors duration-200"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Premium Emerald Button */}
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                className="!h-12 !bg-emerald-600 hover:!bg-emerald-700 active:!bg-emerald-800 !text-white !font-bold !text-base !border-none !rounded-xl shadow-md shadow-emerald-600/10 transition-all duration-200"
              >
                Sign In
              </Button>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

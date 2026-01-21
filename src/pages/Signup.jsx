import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { Cpu, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
import { AppRoute, apis } from '../types';
import axios from 'axios';
import { setUserData } from '../userStore/userData.js';
import { logo } from '../constants';


const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const payLoad = {
    name, email, password
  }
  const handleSubmit = (e) => {
    setIsLoading(true)
    e.preventDefault();
    axios.post(apis.signUp, payLoad).then((res) => {
      setUserData(res.data)
      navigate(AppRoute.E_Verification);

    }).catch((err) => {
      console.log(err);
      setError(err.response.data.error)
    }).finally(() => {
      setIsLoading(false)

    })

  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-surface">
      <div className="relative z-10 w-full max-w-md">

        {/* Title */}
        <div className=" text-center">
          <div className="inline-block rounded-full  w-25 ">
            {/* <Cpu className="w-8 h-8 text-primary" /> */}
            <img src={logo} alt="" />
          </div>
          <h2 className="text-3xl font-bold text-maintext mb-2">Create Account</h2>
          <p className="text-subtext">Join AI Super Assitant to unlock full access</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border p-8 rounded-3xl shadow-xl">

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-maintext ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-subtext" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-maintext placeholder-subtext focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-primary rounded-xl font-bold text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="mt-8 text-center text-sm text-subtext">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>

        {/* Back Home */}
        <Link
          to="/"
          className="mt-8 flex items-center justify-center gap-2 text-subtext hover:text-maintext transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Signup;
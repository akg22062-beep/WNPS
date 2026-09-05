import React, { FormEvent, useState } from 'react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

interface SchoolOfficeLoginProps {
  onAuthenticated: () => void;
}

const OFFICE_USERNAME = import.meta.env.VITE_SCHOOL_USERNAME || 'WISDOM';
const OFFICE_PASSWORD = import.meta.env.VITE_SCHOOL_PASSWORD || 'WISDOM2002@';

export const SchoolOfficeLogin: React.FC<SchoolOfficeLoginProps> = ({ onAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username.trim() === OFFICE_USERNAME && password === OFFICE_PASSWORD) {
      sessionStorage.setItem('wisdom_school_authenticated', 'true');
      onAuthenticated();
      return;
    }
    setError('Incorrect school office username or password.');
    setPassword('');
  };

  return (
    <main className="min-h-screen bg-[#F7F8F6] flex items-center justify-center p-4">
      <section className="w-full max-w-md bg-white rounded-2xl border border-[#E2E8E2] shadow-xl overflow-hidden">
        <div className="bg-[#2D312E] text-white p-7 text-center">
          <div className="mx-auto mb-3 w-14 h-14 rounded-full bg-[#89A894] flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold">Wisdom School Office</h1>
          <p className="text-xs text-white/70 mt-1">Secure fee management portal</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="office-username" className="block text-xs font-bold text-[#4F6D7A] mb-1.5">Username</label>
            <input
              id="office-username"
              value={username}
              onChange={event => setUsername(event.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2.5 text-sm border border-[#E2E8E2] rounded-lg outline-hidden focus:ring-2 focus:ring-[#89A894]"
              placeholder="Enter office username"
            />
          </div>
          <div>
            <label htmlFor="office-password" className="block text-xs font-bold text-[#4F6D7A] mb-1.5">Password</label>
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-[#6B7280]" />
              <input
                id="office-password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8E2] rounded-lg outline-hidden focus:ring-2 focus:ring-[#89A894]"
                placeholder="Enter office password"
              />
            </div>
          </div>
          {error && <p role="alert" className="text-xs text-[#B45309] bg-[#FFF7ED] border border-[#FED7AA] rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" className="w-full py-2.5 rounded-lg bg-[#4F6D7A] hover:bg-[#415A65] text-white text-sm font-bold transition-colors">
            Sign in to School Office
          </button>
        </form>
      </section>
    </main>
  );
};

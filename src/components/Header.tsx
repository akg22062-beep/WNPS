import React from 'react';
import { useSchool } from '../context/SchoolContext';
import { 
  Phone, 
  MessageSquare, 
  QrCode, 
  ShieldCheck, 
  UserCheck, 
  LayoutDashboard, 
  Users, 
  Receipt, 
  CreditCard, 
  FileSpreadsheet, 
  Settings, 
  Download, 
  RotateCcw,
  Wallet,
  Printer
} from 'lucide-react';
import { ActiveTab } from '../types';

interface HeaderProps {
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { 
    schoolInfo, 
    userRole, 
    setUserRole, 
    activeTab, 
    setActiveTab, 
    exportDatabaseJson, 
    resetToDefaults,
    activeStudentPortal,
    setActiveStudentPortal
  } = useSchool();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'students', label: 'Student Records', icon: <Users className="w-4 h-4" /> },
    { id: 'payments', label: 'Fee Slips & Receipts', icon: <Receipt className="w-4 h-4" /> },
    { id: 'expenses', label: 'School Expenses', icon: <Wallet className="w-4 h-4" /> },
    { id: 'feecards', label: 'Fee & Van Cards', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'bulk', label: 'Bulk PDF & WhatsApp', icon: <Printer className="w-4 h-4" /> },
    { id: 'whatsapp', label: 'WhatsApp Alerts & Calls', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'reports', label: 'Monthly Financial Reports', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'settings', label: 'Office Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="no-print bg-[#FDFDFB] border-b border-[#E2E8E2] sticky top-0 z-30 shadow-xs">
      {/* Top emergency contact & admin bar */}
      <div className="bg-[#2D312E] text-white text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[#D68A6E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D68A6E]" />
            Admin: {schoolInfo.adminName}
          </span>
          <span className="text-[#6B7280]">|</span>
          <a 
            href={`tel:${schoolInfo.phone}`} 
            className="flex items-center gap-1 hover:text-[#89A894] transition-colors"
            title="Click to call Admin Office"
          >
            <Phone className="w-3 h-3 text-[#89A894]" />
            {schoolInfo.phone}
          </a>
          <span className="text-[#6B7280] hidden sm:inline">|</span>
          <span className="hidden sm:inline text-neutral-300">
            {schoolInfo.email}
          </span>
          <span className="text-[#6B7280] hidden md:inline">|</span>
          <span className="hidden md:flex items-center gap-1 text-neutral-300">
            <QrCode className="w-3 h-3 text-[#89A894]" />
            UPI / GPay: <span className="font-mono text-[#D68A6E] font-semibold">{schoolInfo.upiId}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportDatabaseJson}
            className="flex items-center gap-1 bg-[#3A3F3B] hover:bg-[#474D48] text-neutral-200 px-2 py-0.5 rounded text-xs transition-colors border border-[#4F6D7A]/30"
            title="Download JSON data backup"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button
            onClick={resetToDefaults}
            className="flex items-center gap-1 bg-[#3A3F3B] hover:bg-[#D68A6E]/30 text-neutral-300 hover:text-[#D68A6E] px-2 py-0.5 rounded text-xs transition-colors border border-[#4F6D7A]/30"
            title="Reset to default demo data"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="px-2 py-0.5 rounded text-xs font-medium text-neutral-300 hover:text-white hover:bg-[#D68A6E]/30 transition-colors"
              title="Sign out of school office"
            >
              Sign out
            </button>
          )}

          {/* Portal Switcher */}
          <div className="flex bg-[#1E2220] p-0.5 rounded-md border border-[#3A3F3B]">
            <button
              onClick={() => {
                setUserRole('admin');
                setActiveStudentPortal(null);
              }}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                userRole === 'admin'
                  ? 'bg-[#4F6D7A] text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              School Office
            </button>
            <button
              onClick={() => {
                setUserRole('parent');
              }}
              className={`px-2.5 py-0.5 rounded text-xs font-medium transition-all ${
                userRole === 'parent'
                  ? 'bg-[#89A894] text-white shadow-xs'
                  : 'text-neutral-300 hover:text-white'
              }`}
            >
              Parent Portal
            </button>
          </div>
        </div>
      </div>

      {/* Main School Brand Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={`${import.meta.env.BASE_URL}school_logo.jpg`} 
                alt="Wisdom Nursery and Primary School Seal" 
                className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-[#89A894] shadow-xs object-cover bg-white"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-[#2D312E]">
                  {schoolInfo.name}
                </h1>
                <span className="bg-[#89A894]/15 text-[#4F6D7A] text-[11px] font-bold px-2 py-0.5 rounded-full border border-[#89A894]/30">
                  Essur - 603301
                </span>
              </div>
              <p className="text-xs text-[#6B7280] font-medium tracking-wide">
                {schoolInfo.address} • <span className="italic text-[#4F6D7A] font-semibold">{schoolInfo.tagline}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <a
              href={`tel:${schoolInfo.phone}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F2F4F2] hover:bg-[#E2E8E2] text-[#2D312E] border border-[#E2E8E2] rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#4F6D7A]" />
              <span>Call Office</span>
            </a>
            <a
              href={`https://wa.me/919176593129?text=${encodeURIComponent('Hello Wisdom School Office Admin R. Saravanan, I have a fee enquiry.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#89A894] hover:bg-[#789683] text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Admin</span>
            </a>
          </div>
        </div>

        {/* Navigation Tabs for Admin */}
        {userRole === 'admin' && (
          <div className="mt-3 pt-2 border-t border-[#E2E8E2] flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#4F6D7A] text-white shadow-xs'
                      : 'text-[#2D312E]/80 hover:bg-[#F2F4F2] hover:text-[#2D312E]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Parent Portal Info Header */}
        {userRole === 'parent' && (
          <div className="mt-2 pt-2 border-t border-[#E2E8E2] flex items-center justify-between text-xs text-[#6B7280]">
            <span className="flex items-center gap-1 font-semibold text-[#4F6D7A]">
              <UserCheck className="w-4 h-4 text-[#89A894]" />
              Student & Parent Self-Service Portal
            </span>
            <span>
              Search your child's record, download fee slips, or pay via Google Pay
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

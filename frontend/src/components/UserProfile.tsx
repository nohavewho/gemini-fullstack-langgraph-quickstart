import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/LanguageContext';
import { Button } from './ui/button';
import { User, LogOut, Settings, History } from 'lucide-react';

interface UserProfileProps {
  onShowHistory?: () => void;
}

export function UserProfile({ onShowHistory }: UserProfileProps) {
  const { user, dbUser, logout, loginWithRedirect, isLoading } = useAuth();
  const { t } = useTranslation();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isLoading) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="w-10 h-10 bg-[#003d5c]/80 rounded-full animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={loginWithRedirect}
          className="bg-[#ffd700] text-[#003d5c] hover:bg-[#ffd700]/90 border-2 border-[#ffd700] font-semibold"
        >
          <User className="w-4 h-4 mr-2" />
          Login
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 bg-[#003d5c]/90 border-2 border-[#ffd700]/50 rounded-full px-3 py-2 hover:bg-[#ffd700]/20 transition-all"
      >
        {user.picture ? (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-[#ffd700] rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-[#003d5c]" />
          </div>
        )}
        <span className="text-[#ffd700] font-medium hidden md:block">
          {user.name || user.email}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-[#003d5c] border-2 border-[#ffd700]/50 rounded-xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-[#ffd700]/20">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-[#ffd700] rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-[#003d5c]" />
                </div>
              )}
              <div>
                <div className="text-[#ffd700] font-semibold">{user.name}</div>
                <div className="text-[#ffd700]/70 text-sm">{user.email}</div>
              </div>
            </div>
          </div>

          <div className="p-2">
            {onShowHistory && (
              <button
                onClick={() => {
                  onShowHistory();
                  setShowDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-[#ffd700] hover:bg-[#ffd700]/20 rounded-lg transition-colors"
              >
                <History className="w-4 h-4" />
                Chat History
              </button>
            )}
            
            <button
              onClick={() => setShowDropdown(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[#ffd700] hover:bg-[#ffd700]/20 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            
            <hr className="my-2 border-[#ffd700]/20" />
            
            <button
              onClick={() => {
                logout();
                setShowDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-[#ef3340] hover:bg-[#ef3340]/20 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 -z-10" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
import React from 'react';
import { User, GraduationCap, Users } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  gender?: 'Male' | 'Female';
  role?: 'student' | 'teacher' | 'parent' | 'admin';
  className?: string;
}

export default function UserAvatar({
  name,
  photo,
  size = 'md',
  gender,
  role = 'student',
  className = ''
}: UserAvatarProps) {
  // If user provided a real base64 or valid non-placeholder photo:
  const hasCustomPhoto = photo && photo.trim() !== '' && !photo.includes('images.unsplash.com');

  const sizeClasses = {
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-20 h-20 text-lg'
  };

  const getInitials = (str: string) => {
    if (!str || !str.trim()) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (hasCustomPhoto) {
    return (
      <img
        src={photo}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover border border-slate-200 shadow-xs shrink-0 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  // Consistent color generation based on name
  const bgGradients = [
    'from-[#042954] to-[#0a417d]',
    'from-emerald-700 to-teal-800',
    'from-blue-700 to-indigo-800',
    'from-amber-600 to-amber-700',
    'from-purple-700 to-indigo-900',
    'from-cyan-700 to-blue-800'
  ];

  const charCode = (name || 'A').charCodeAt(0) + (name || 'A').charCodeAt((name || 'A').length - 1);
  const selectedGradient = bgGradients[charCode % bgGradients.length];

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-linear-to-tr ${selectedGradient} text-white font-bold flex items-center justify-center border border-white/30 shadow-xs shrink-0 select-none ${className}`}
      title={name}
    >
      <span>{getInitials(name)}</span>
    </div>
  );
}

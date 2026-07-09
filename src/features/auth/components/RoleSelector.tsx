'use client';

import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/config/roles';
import { 
  Search, Check, Shield, Users, Activity, Building, Map, 
  ChevronDown, HeartPulse, Stethoscope, MapPin, FlaskConical, Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type RoleCategory = 'PUBLIC' | 'COMMUNITY HEALTH' | 'CLINICAL STAFF' | 'ADMINISTRATION' | 'PLATFORM';

export interface RoleDef {
  id: UserRole;
  name: string;
  category: RoleCategory;
  description: string;
  icon: React.ElementType;
  requiresInvitation: boolean;
}

export const ROLE_DEFINITIONS: RoleDef[] = [
  {
    id: 'citizen',
    name: 'Citizen (Patient)',
    category: 'PUBLIC',
    description: 'Access your personal healthcare services',
    icon: Users,
    requiresInvitation: false,
  },
  {
    id: 'asha_worker',
    name: 'ASHA Worker',
    category: 'COMMUNITY HEALTH',
    description: 'Community healthcare and field services',
    icon: HeartPulse,
    requiresInvitation: false,
  },
  {
    id: 'doctor',
    name: 'Doctor',
    category: 'CLINICAL STAFF',
    description: 'Consult patients and manage treatment',
    icon: Stethoscope,
    requiresInvitation: false,
  },
  {
    id: 'nurse',
    name: 'Nurse',
    category: 'CLINICAL STAFF',
    description: 'Patient care, monitoring and ward management',
    icon: Activity,
    requiresInvitation: false,
  },
  {
    id: 'lab_technician',
    name: 'Laboratory Technician',
    category: 'CLINICAL STAFF',
    description: 'Diagnostic testing and laboratory operations',
    icon: FlaskConical,
    requiresInvitation: false,
  },
  {
    id: 'pharmacist',
    name: 'Pharmacist',
    category: 'CLINICAL STAFF',
    description: 'Medicine dispensing and inventory management',
    icon: Pill,
    requiresInvitation: false,
  },
  {
    id: 'hospital_admin',
    name: 'Hospital Administrator',
    category: 'ADMINISTRATION',
    description: 'Hospital operations and resource management',
    icon: Building,
    requiresInvitation: false,
  },
  {
    id: 'district_admin',
    name: 'District Health Officer',
    category: 'ADMINISTRATION',
    description: 'District healthcare monitoring and analytics',
    icon: Map,
    requiresInvitation: false,
  },
  {
    id: 'state_admin',
    name: 'State Health Officer',
    category: 'ADMINISTRATION',
    description: 'Statewide healthcare oversight',
    icon: MapPin,
    requiresInvitation: false,
  },
  {
    id: 'super_admin',
    name: 'Super Administrator',
    category: 'PLATFORM',
    description: 'Platform administration and system management',
    icon: Shield,
    requiresInvitation: false,
  },
];

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
  error?: boolean;
}

export function RoleSelector({ value, onChange, disabled, error }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRole = ROLE_DEFINITIONS.find(r => r.id === value) || ROLE_DEFINITIONS[0];

  const filteredRoles = ROLE_DEFINITIONS.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  );

  const groupedRoles = filteredRoles.reduce((acc, role) => {
    if (!acc[role.category]) acc[role.category] = [];
    acc[role.category].push(role);
    return acc;
  }, {} as Record<RoleCategory, RoleDef[]>);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (role: RoleDef) => {
    onChange(role.id);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left px-4 py-3 bg-white dark:bg-slate-900 border rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 ${
          error 
            ? 'border-red-500 focus:ring-red-500/20 dark:border-red-900/50' 
            : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20 hover:border-slate-300 dark:hover:border-slate-700'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <selectedRole.icon className="w-4.5 h-4.5" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm truncate">
              {selectedRole.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {selectedRole.category}
            </span>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px]"
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search roles or features..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Options List */}
            <div className="overflow-y-auto p-2 space-y-4">
              {Object.entries(groupedRoles).map(([category, roles]) => (
                <div key={category} className="space-y-1">
                  <div className="px-3 py-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {category}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {roles.map((role) => {
                      const isSelected = role.id === value;
                      
                      return (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => handleSelect(role)}
                          className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all relative ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent cursor-pointer hover:shadow-sm'
                          }`}
                        >
                          <div className={`flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg ${
                            isSelected 
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                            <role.icon className="w-4.5 h-4.5" />
                          </div>
                          
                          <div className="flex-1 min-w-0 pr-6">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={`font-semibold text-sm ${
                                isSelected 
                                  ? 'text-blue-700 dark:text-blue-400' 
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}>
                                {role.name}
                              </span>
                              {isSelected && (
                                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 absolute right-4 top-4" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {role.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              
              {filteredRoles.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">No roles found matching &quot;{search}&quot;</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

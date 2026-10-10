import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Tv, 
  LayoutDashboard, 
  FileText, 
  Sparkles, 
  Mic, 
  FolderHeart, 
  Calendar, 
  ShieldAlert, 
  MessageSquare,
  Lock,
  UserCheck,
  Sliders,
  Brain,
  Cpu,
  Server,
  Terminal,
  ShieldCheck,
  Facebook,
  Mail,
  Smartphone
} from 'lucide-react';
import { UserRolePayload, OSUserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRolePayload;
  setUserRole: (role: UserRolePayload) => void;
}

export const ROLES: Record<string, UserRolePayload> = {
  admin: {
    role: 'admin',
    osRole: 'ADMIN',
    permissions: { canPublish: true, canGenerateAI: true, canEditRepository: true, canManageUsers: true }
  },
  owner: {
    role: 'admin',
    osRole: 'OWNER',
    permissions: { canPublish: true, canGenerateAI: true, canEditRepository: true, canManageUsers: true }
  },
  developer: {
    role: 'admin',
    osRole: 'DEVELOPER',
    permissions: { canPublish: true, canGenerateAI: true, canEditRepository: true, canManageUsers: false }
  },
  editor: {
    role: 'editor',
    osRole: 'EDITOR',
    permissions: { canPublish: false, canGenerateAI: true, canEditRepository: true, canManageUsers: false }
  },
  creator: {
    role: 'creator',
    osRole: 'USER',
    permissions: { canPublish: false, canGenerateAI: true, canEditRepository: false, canManageUsers: false }
  },
  viewer: {
    role: 'viewer',
    osRole: 'VIEWER',
    permissions: { canPublish: false, canGenerateAI: false, canEditRepository: false, canManageUsers: false }
  }
};

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  isNew?: boolean;
  badge?: string;
  allowedRoles?: OSUserRole[];
}

export default function Sidebar({ activeTab, setActiveTab, userRole, setUserRole }: SidebarProps) {
  const currentOsRole: OSUserRole = userRole.osRole || (userRole.role === 'admin' ? 'ADMIN' : 'USER');
  const isPrivilegedRole = currentOsRole === 'ADMIN' || currentOsRole === 'OWNER';

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard & Insights', icon: LayoutDashboard },
    { 
      id: 'gnn_os', 
      label: 'Cloud/Docker Controls', 
      icon: Server, 
      isNew: true,
      badge: 'ADMIN',
      allowedRoles: ['ADMIN', 'OWNER'] 
    },
    { 
      id: 'aibrain', 
      label: 'Developer Mode', 
      icon: Terminal, 
      badge: 'DEV',
      allowedRoles: ['ADMIN', 'OWNER'] 
    },
    { id: 'news', label: 'Grounded News & Scripts', icon: FileText },
    { 
      id: 'gmail', 
      label: 'Gmail News Desk', 
      icon: Mail, 
      isNew: true, 
      badge: 'GMAIL' 
    },
    { id: 'approvals', label: 'Script Approval Flow', icon: ShieldCheck, badge: 'FLOW' },
    { id: 'studio', label: 'AI Studio Director', icon: Sparkles },
    { 
      id: 'fastmcp_vmix', 
      label: 'FastMCP vMix Switcher', 
      icon: Tv, 
      isNew: true,
      badge: 'AUTO'
    },
    { 
      id: 'mobile_companion', 
      label: 'Expo Mobile Companion', 
      icon: Smartphone, 
      isNew: true,
      badge: 'EXPO'
    },
    { id: 'audio', label: 'Vocal Lab', icon: Mic },
    { id: 'manual_edit', label: 'GNN Manual Edit Panel', icon: Sliders },
    { id: 'repository', label: 'Media Repository', icon: FolderHeart },
    { id: 'scheduler', label: 'Facebook & Social Studio', icon: Facebook, isNew: true, badge: 'AUTO' },
    { id: 'chat', label: 'Broadcast AI Assistant', icon: MessageSquare },
  ];

  // Filter menu items based on authorized role
  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(currentOsRole);
  });

  // Fallback to dashboard if currently on a tab that the switched role cannot access
  useEffect(() => {
    const activeItem = menuItems.find((i) => i.id === activeTab);
    if (activeItem?.allowedRoles && !activeItem.allowedRoles.includes(currentOsRole)) {
      setActiveTab('dashboard');
    }
  }, [currentOsRole, activeTab, setActiveTab]);

  return (
    <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between text-slate-100 min-h-screen">
      <div>
        {/* Brand Banner */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3 bg-gradient-to-r from-red-650 to-blue-950/70">
          <div className="w-10 h-10 rounded-lg bg-red-650 flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg text-white">GNN TV</h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">Global News Network</p>
          </div>
        </div>

        {/* User Role Quick Switcher */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400" /> Authorized Role
            </span>
            <span className={`text-[10px] border px-2 py-0.5 rounded font-mono uppercase font-semibold ${
              isPrivilegedRole 
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
            }`}>
              {currentOsRole}
            </span>
          </div>
          <select 
            id="sidebar-role-selector"
            aria-label="Select authorized role"
            value={
              userRole.osRole === 'OWNER' ? 'owner' :
              userRole.osRole === 'DEVELOPER' ? 'developer' :
              userRole.role
            }
            onChange={(e) => setUserRole(ROLES[e.target.value] || ROLES.admin)}
            className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-red-500 font-sans cursor-pointer transition-colors"
          >
            <option value="owner">Station Owner (OWNER) — Full Access</option>
            <option value="admin">System Station Director (ADMIN) — Full Access</option>
            <option value="developer">Platform & Git Engineer (DEVELOPER)</option>
            <option value="editor">Broadcast Chief Editor (EDITOR)</option>
            <option value="creator">Creative News Anchor (USER)</option>
            <option value="viewer">Platform Observer (VIEWER)</option>
          </select>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1.5">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={`relative w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-sans font-medium transition-colors cursor-pointer overflow-hidden ${
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-red-600 rounded-lg shadow-lg shadow-red-650/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="font-semibold">{item.label}</span>
                </div>
                <div className="relative z-10 flex items-center gap-1">
                  {item.badge && (
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                      item.badge === 'ADMIN'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold uppercase">
                      LIVE
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Permissions Footnote */}
      <div className="p-4 border-t border-slate-900 bg-slate-950/80">
        <div className="p-3 bg-slate-900/60 rounded border border-slate-900/50 space-y-2">
          <div className="text-[11px] font-mono text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Station Access Profile
            </span>
            {isPrivilegedRole && (
              <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Privileged
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono font-medium text-slate-400">
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${userRole.permissions.canPublish ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>Publish</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${userRole.permissions.canGenerateAI ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>AI Engine</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${userRole.permissions.canEditRepository ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>Repository</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isPrivilegedRole ? 'bg-emerald-500' : 'bg-red-500'}`} />
              <span>Cloud/Docker</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

'use client';

import Image from 'next/image';
import { Users, User, Plus, Trash2 } from 'lucide-react';
import type { TeamMember } from '../types';

interface TeamTabProps {
  teamMembers: TeamMember[];
  ownerName: string;
  ownerEmail: string;
  onInviteClick: () => void;
  onRemoveMember: (id: string) => void;
}

export function TeamTab({ teamMembers, ownerName, ownerEmail, onInviteClick, onRemoveMember }: TeamTabProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Team Members</h2>
          <p className="text-sm text-white/50">Manage who has access to your business dashboard</p>
        </div>
        <button
          onClick={onInviteClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
        >
          <Plus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {/* Owner */}
      <div className="p-4 bg-white/5 rounded-xl mb-4 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <User className="h-6 w-6 text-white/50" />
            </div>
            <div>
              <p className="font-medium text-white">{ownerName}</p>
              <p className="text-sm text-white/50">{ownerEmail}</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-medium rounded-full">
            Owner
          </span>
        </div>
      </div>

      {/* Team Members */}
      {teamMembers.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
          <Users className="h-12 w-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/50">No team members yet</p>
          <p className="text-sm text-white/30 mt-1">Invite people to help manage your business</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teamMembers.map(member => (
            <div key={member.id} className="p-4 border border-white/10 rounded-xl bg-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                    {member.user?.avatar ? (
                      <Image src={member.user.avatar} alt="" width={48} height={48} className="rounded-full" />
                    ) : (
                      <User className="h-6 w-6 text-white/40" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {member.user ? `${member.user.firstName} ${member.user.lastName}` : 'Pending...'}
                    </p>
                    <p className="text-sm text-white/50">{member.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    member.inviteStatus === 'accepted' 
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : member.inviteStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-red-500/20 text-red-400'
                  }`}>
                    {member.inviteStatus}
                  </span>
                  <span className="px-2 py-0.5 bg-white/10 text-white/70 text-xs font-medium rounded-full capitalize">
                    {member.role}
                  </span>
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Permissions */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                {member.canManageAppointments && (
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md">Appointments</span>
                )}
                {member.canManageChat && (
                  <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-md">Chat</span>
                )}
                {member.canEditBusiness && (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-md">Edit Business</span>
                )}
                {member.canManageTeam && (
                  <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-md">Manage Team</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

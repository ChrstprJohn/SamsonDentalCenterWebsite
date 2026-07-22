'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Globe, ExternalLink, MessageCircle, Send } from 'lucide-react';

export function SecretaryProfileOverviewView() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <h1 className="text-slate-900 text-lg font-bold mb-6">My Profile</h1>

      <div className="max-w-3xl flex flex-col gap-6">
        {/* Card 1: Profile Header & Details */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          {/* Top Row: Avatar + Name | Edit */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="size-16 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold ring-2 ring-white shadow-sm">
                CM
              </div>
              <div className="min-w-0">
                <h2 className="text-slate-900 text-base font-bold truncate">Chowdury Musharof</h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Team Manager <span className="mx-1">&middot;</span> Arizona, United States
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium px-3.5 py-1.5 border border-slate-200 rounded-lg h-auto"
            >
              <Pencil className="size-3 mr-1.5" />
              Edit
            </Button>
          </div>

          {/* Bottom Grid: Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">First Name</p>
              <p className="text-sm font-semibold text-slate-800">Chowdury</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Last Name</p>
              <p className="text-sm font-semibold text-slate-800">Musharof</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Email address</p>
              <p className="text-sm font-semibold text-slate-800 truncate">randomuser@pimjo.com</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Phone</p>
              <p className="text-sm font-semibold text-slate-800">+09 363 398 46</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Bio</p>
              <p className="text-sm font-semibold text-slate-800">Team Manager</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Social Links</p>
              <div className="flex items-center gap-3 mt-1">
                <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors" title="Website">
                  <Globe className="size-4" />
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors" title="Email">
                  <ExternalLink className="size-4" />
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors" title="Chat">
                  <MessageCircle className="size-4" />
                </a>
                <a href="#" className="text-slate-700 hover:text-blue-600 transition-colors" title="Share">
                  <Send className="size-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Address */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-slate-900 text-base font-bold">Address</h2>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 bg-white hover:bg-slate-50 text-xs text-slate-700 font-medium px-3.5 py-1.5 border border-slate-200 rounded-lg h-auto"
            >
              <Pencil className="size-3 mr-1.5" />
              Edit
            </Button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mt-6">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Country</p>
              <p className="text-sm font-semibold text-slate-800">United States</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">City/State</p>
              <p className="text-sm font-semibold text-slate-800">Arizona, United States</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">Postal Code</p>
              <p className="text-sm font-semibold text-slate-800">ERT 2489</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1.5">TAX ID</p>
              <p className="text-sm font-semibold text-slate-800">AS4568384</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Search, Bell, ChevronDown, Check } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { currentUser, mockWorkspaces } from '../data/mockData';

export function TopBar() {
  const [selectedWorkspace, setSelectedWorkspace] = useState(mockWorkspaces[0]);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search projects, tasks, or people..."
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
            3
          </Badge>
        </button>
        
        <div className="h-8 w-px bg-gray-200" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors">
              <div className="text-right">
                <p className="text-sm">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.role}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile Settings</DropdownMenuItem>
            <DropdownMenuItem>Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="h-8 w-px bg-gray-200" />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">{selectedWorkspace.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Switch Workspace</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockWorkspaces.map((workspace) => (
              <DropdownMenuItem
                key={workspace.id}
                onClick={() => setSelectedWorkspace(workspace)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded flex items-center justify-center text-white text-xs">
                    {workspace.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">{workspace.name}</p>
                    <p className="text-xs text-gray-500">{workspace.type}</p>
                  </div>
                </div>
                {selectedWorkspace.id === workspace.id && (
                  <Check className="w-4 h-4 text-blue-600" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

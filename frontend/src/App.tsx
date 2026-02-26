import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { OverviewView } from './components/overview/OverviewView';
import { ProjectsView } from './components/projects/ProjectsView';
import { OrganizationView } from './components/organization/OrganizationView';
import { AccountView } from './components/account/AccountView';
import { SettingsView } from './components/settings/SettingsView';
import { PersonalDashboard } from './components/personal/PersonalDashboard';
import { PersonalProjectsView } from './components/personal/PersonalProjectsView';
import { PersonalTasksView } from './components/personal/PersonalTasksView';
import { PersonalDraftsView } from './components/personal/PersonalDraftsView';
import { LoginPage } from './components/login/LoginPage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('overview');

  if (!isLoggedIn) {
    return <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return <OverviewView />;
      case 'projects':
        return <ProjectsView />;
      case 'organization':
        return <OrganizationView />;
      case 'account':
        return <AccountView />;
      case 'settings':
        return <SettingsView />;
      case 'personal-dashboard':
        return <PersonalDashboard />;
      case 'personal-projects':
        return <PersonalProjectsView />;
      case 'personal-tasks':
        return <PersonalTasksView />;
      case 'personal-drafts':
        return <PersonalDraftsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
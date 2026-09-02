import {
  FileArchive,
  History,
  KeyRound,
  LayoutDashboard,
  Music2,
  Settings,
  ShieldCheck,
} from 'lucide-react';

export const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'create', label: 'Create Vault', icon: FileArchive },
  { id: 'unlock', label: 'Unlock Vault', icon: KeyRound },
  { id: 'melody', label: 'Melody Capture', icon: Music2 },
  { id: 'history', label: 'Vault History', icon: History },
  { id: 'security', label: 'Security Model', icon: ShieldCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const emptyMonitorForm = {
  projectId: '',
  groupName: 'Default',
  url: '',
  method: 'GET',
  interval: '60000',
  timeoutMs: '10000',
  expectedStatusCodes: '200',
  headersText: '',
  body: '',
  responseKeyword: '',
  checkTypes: ['HTTP'],
  regionsText: 'primary',
  cronExpression: '',
  notificationEmailsText: '',
  publicStatusEnabled: true,
  active: true,
};

export const methodOptions = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'PATCH', label: 'PATCH' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'HEAD', label: 'HEAD' },
];

export const intervalOptions = [
  { value: '30000', label: '30s' },
  { value: '60000', label: '1m' },
  { value: '120000', label: '2m' },
  { value: '300000', label: '5m' },
  { value: '900000', label: '15m' },
];

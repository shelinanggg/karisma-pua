import { Settings, Zap, Brain, Lock, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Platform Settings</h1>
        <p className="text-gray-600 mt-1">Configure platform-level preferences and integrations</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="ai">AI Governance</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Platform Preferences
              </CardTitle>
              <CardDescription>Configure general platform settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName" className="mb-2 block">Organization Name</Label>
                  <input
                    id="orgName"
                    type="text"
                    defaultValue="Acme Corporation"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone" className="mb-2 block">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="cet">CET (Central European Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language" className="mb-2 block">Default Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="mb-4">Workspace Settings</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Allow Personal Workspaces</p>
                      <p className="text-xs text-gray-500">Let users create private workspaces</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Admin Visibility on Personal Workspaces</p>
                      <p className="text-xs text-gray-500">Admins can view all personal workspaces</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Auto-Archive Completed Projects</p>
                      <p className="text-xs text-gray-500">Archive projects 30 days after completion</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connectors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Connector Configuration
              </CardTitle>
              <CardDescription>Manage API keys and connection settings for external services</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">MS</span>
                      </div>
                      <div>
                        <p>Microsoft Teams</p>
                        <p className="text-sm text-gray-500">Real-time collaboration integration</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="teamsWebhook" className="text-sm">Webhook URL</Label>
                      <input
                        id="teamsWebhook"
                        type="text"
                        placeholder="https://outlook.office.com/webhook/..."
                        className="w-full px-3 py-2 border rounded mt-1 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Test Connection</Button>
                      <Button size="sm">Save</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">SP</span>
                      </div>
                      <div>
                        <p>SharePoint</p>
                        <p className="text-sm text-gray-500">Document management and storage</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="sharepointSite" className="text-sm">Site URL</Label>
                      <input
                        id="sharepointSite"
                        type="text"
                        placeholder="https://yourcompany.sharepoint.com/sites/..."
                        className="w-full px-3 py-2 border rounded mt-1 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sharepointLibrary" className="text-sm">Document Library</Label>
                      <input
                        id="sharepointLibrary"
                        type="text"
                        placeholder="Shared Documents"
                        className="w-full px-3 py-2 border rounded mt-1 text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Test Connection</Button>
                      <Button size="sm">Save</Button>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">OD</span>
                      </div>
                      <div>
                        <p>OneDrive</p>
                        <p className="text-sm text-gray-500">Cloud file storage and sync</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500">Connect your OneDrive account to enable file storage</p>
                    <Button size="sm">Connect OneDrive</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Governance Policies
              </CardTitle>
              <CardDescription>Configure AI model usage, security, and compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="aiModel" className="mb-2 block">Default AI Model</Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger id="aiModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4 (Advanced)</SelectItem>
                    <SelectItem value="gpt35">GPT-3.5 (Standard)</SelectItem>
                    <SelectItem value="claude">Claude 2 (Alternative)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <p>AI Features</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Enable Project AI Assistants</p>
                      <p className="text-xs text-gray-500">RAG-based chatbots for project context</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">AI-Powered Task Suggestions</p>
                      <p className="text-xs text-gray-500">Automatically suggest next tasks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Document Summarization</p>
                      <p className="text-xs text-gray-500">Auto-generate summaries of deliverables</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="mb-4">Privacy & Security</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Prompt Visibility</p>
                      <p className="text-xs text-gray-500">Admins can view AI conversation logs</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Data Retention</p>
                      <p className="text-xs text-gray-500">Keep AI conversation history for 90 days</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Sensitive Data Filtering</p>
                      <p className="text-xs text-gray-500">Block PII from being sent to AI models</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="aiGuidelines" className="mb-2 block">Usage Guidelines</Label>
                <Textarea
                  id="aiGuidelines"
                  placeholder="Enter organizational guidelines for AI usage..."
                  className="min-h-24"
                  defaultValue="All AI-generated content must be reviewed by a human before being shared with clients. Do not include sensitive or confidential information in AI prompts."
                />
              </div>

              <div className="flex justify-end">
                <Button>Save AI Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data & Privacy Settings
              </CardTitle>
              <CardDescription>Manage data retention, backup, and privacy policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="mb-4">Data Retention</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Completed Projects</p>
                      <p className="text-xs text-gray-500">Keep data for</p>
                    </div>
                    <Select defaultValue="1year">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 months</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="2years">2 years</SelectItem>
                        <SelectItem value="forever">Forever</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Deleted Items</p>
                      <p className="text-xs text-gray-500">Retention period</p>
                    </div>
                    <Select defaultValue="30days">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 days</SelectItem>
                        <SelectItem value="30days">30 days</SelectItem>
                        <SelectItem value="90days">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="mb-4">Backup & Recovery</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Automatic Backups</p>
                      <p className="text-xs text-gray-500">Daily backups at 2:00 AM UTC</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Last Backup</p>
                      <p className="text-xs text-gray-500">October 12, 2025 at 2:15 AM</p>
                    </div>
                    <Button variant="outline" size="sm">Download Backup</Button>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5" />
                  <p>Data Export</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Export all your organization's data in a portable format
                </p>
                <Button variant="outline">Request Data Export</Button>
              </div>

              <div className="border-t pt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="mb-2">Danger Zone</p>
                <p className="text-sm text-gray-600 mb-4">
                  Permanently delete all organization data. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm">Delete Organization</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

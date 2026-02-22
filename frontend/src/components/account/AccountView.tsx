import { User, Mail, Bell, Palette, Shield, Link } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { currentUser } from '../../data/mockData';

export function AccountView() {
  return (
    <div className="space-y-6">
      <div>
        <h1>Account Settings</h1>
        <p className="text-gray-600 mt-1">Manage your profile and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="linked">Linked Accounts</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-sm text-gray-500">JPG, GIF or PNG. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue={currentUser.name.split(' ')[0]} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue={currentUser.name.split(' ')[1]} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={currentUser.email} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" defaultValue={currentUser.role} disabled />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your password and security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>

              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Linked Accounts
              </CardTitle>
              <CardDescription>Manage your connected accounts and SSO integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p>Microsoft Account</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p>Google Account</p>
                      <p className="text-sm text-gray-500">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p>Internal SSO</p>
                      <p className="text-sm text-gray-500">{currentUser.email}</p>
                    </div>
                  </div>
                  <Badge variant="default">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <p className="mb-4">Email Notifications</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Task Assignments</p>
                        <p className="text-xs text-gray-500">Get notified when you're assigned a new task</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Project Updates</p>
                        <p className="text-xs text-gray-500">Receive updates on projects you're involved in</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Deadline Reminders</p>
                        <p className="text-xs text-gray-500">Get reminded about upcoming deadlines</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Weekly Summary</p>
                        <p className="text-xs text-gray-500">Receive a weekly summary of your activities</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <p className="mb-4">In-App Notifications</p>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Comments & Mentions</p>
                        <p className="text-xs text-gray-500">When someone mentions you in a comment</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm">Status Changes</p>
                        <p className="text-xs text-gray-500">When task or project status changes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance Settings
              </CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border-2 border-blue-500 rounded-lg p-4 cursor-pointer">
                    <div className="w-full h-20 bg-white border rounded mb-2" />
                    <p className="text-sm text-center">Light</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-gray-300">
                    <div className="w-full h-20 bg-gray-900 rounded mb-2" />
                    <p className="text-sm text-center">Dark</p>
                  </div>
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-gray-300">
                    <div className="w-full h-20 bg-gradient-to-br from-white to-gray-900 rounded mb-2" />
                    <p className="text-sm text-center">Auto</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Density</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <input type="radio" name="density" id="comfortable" defaultChecked />
                    <Label htmlFor="comfortable" className="cursor-pointer">Comfortable - More spacing</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="radio" name="density" id="compact" />
                    <Label htmlFor="compact" className="cursor-pointer">Compact - Less spacing</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

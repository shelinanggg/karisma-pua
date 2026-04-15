import { Brain, Database, Lock, Settings, Zap } from 'lucide-react';
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
        <h1>Pengaturan</h1>
        <p className="text-gray-600 mt-1">Atur preferensi platform, integrasi, dan keamanan data</p>
      </div>

      <Tabs defaultValue="umum" className="w-full">
        <TabsList>
          <TabsTrigger value="umum">Umum</TabsTrigger>
          <TabsTrigger value="integrasi">Integrasi</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
          <TabsTrigger value="data">Data & Privasi</TabsTrigger>
        </TabsList>

        <TabsContent value="umum" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Preferensi Platform
              </CardTitle>
              <CardDescription>Konfigurasi umum untuk organisasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="orgName" className="mb-2 block">Nama Organisasi</Label>
                  <input
                    id="orgName"
                    type="text"
                    defaultValue="Perpustakaan Universitas Airlangga"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="timezone" className="mb-2 block">Zona Waktu Default</Label>
                  <Select defaultValue="wib">
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wib">WIB (UTC+7)</SelectItem>
                      <SelectItem value="wita">WITA (UTC+8)</SelectItem>
                      <SelectItem value="wit">WIT (UTC+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language" className="mb-2 block">Bahasa</Label>
                  <Select defaultValue="id">
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">Indonesia</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-6">
                <p className="mb-4">Pengaturan Workspace</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Izinkan Workspace Personal</p>
                      <p className="text-xs text-gray-500">Pengguna dapat membuat workspace pribadi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">Arsipkan Otomatis Kegiatan Selesai</p>
                      <p className="text-xs text-gray-500">Kegiatan diarsipkan 30 hari setelah selesai</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Simpan Pengaturan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrasi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Konfigurasi Integrasi
              </CardTitle>
              <CardDescription>Kelola koneksi layanan eksternal</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Microsoft Teams</p>
                      <p className="text-sm text-gray-500">Integrasi notifikasi dan kolaborasi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>SharePoint</p>
                      <p className="text-sm text-gray-500">Manajemen dokumen organisasi</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p>OneDrive</p>
                      <p className="text-sm text-gray-500">Sinkronisasi dan penyimpanan file</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Uji Koneksi</Button>
                <Button>Simpan Integrasi</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Pengaturan AI
              </CardTitle>
              <CardDescription>Atur penggunaan AI secara aman dan terkontrol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="aiModel" className="mb-2 block">Model AI Default</Label>
                <Select defaultValue="gpt4">
                  <SelectTrigger id="aiModel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt4">GPT-4 (Rekomendasi)</SelectItem>
                    <SelectItem value="gpt35">GPT-3.5 (Hemat)</SelectItem>
                    <SelectItem value="claude">Claude (Alternatif)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Aktifkan Saran Tugas Berbasis AI</p>
                    <p className="text-xs text-gray-500">Membantu rekomendasi langkah kerja berikutnya</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Ringkasan Dokumen Otomatis</p>
                    <p className="text-xs text-gray-500">Menyediakan ringkasan dari dokumen kegiatan</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Filter Data Sensitif</p>
                    <p className="text-xs text-gray-500">Memblokir data sensitif dari prompt AI</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="border-t pt-6">
                <Label htmlFor="aiGuidelines" className="mb-2 block">Panduan Penggunaan AI</Label>
                <Textarea
                  id="aiGuidelines"
                  className="min-h-24"
                  defaultValue="Semua output AI harus ditinjau manusia sebelum dipublikasikan. Hindari memasukkan data rahasia ke prompt."
                />
              </div>

              <div className="flex justify-end">
                <Button>Simpan Pengaturan AI</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Data dan Privasi
              </CardTitle>
              <CardDescription>Kelola retensi, backup, dan keamanan data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Backup Otomatis</p>
                    <p className="text-xs text-gray-500">Backup harian pukul 02.00 WIB</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Backup Terakhir</p>
                    <p className="text-xs text-gray-500">12 Oktober 2025, 02:15 WIB</p>
                  </div>
                  <Button variant="outline" size="sm">Unduh Backup</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5" />
                  <p>Ekspor Data</p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Ekspor seluruh data organisasi dalam format portabel
                </p>
                <Button variant="outline">Ajukan Ekspor Data</Button>
              </div>

              <div className="border-t pt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="mb-2">Zona Berbahaya</p>
                <p className="text-sm text-gray-600 mb-4">
                  Menghapus seluruh data organisasi secara permanen. Tindakan ini tidak dapat dibatalkan.
                </p>
                <Button variant="destructive" size="sm">Hapus Data Organisasi</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

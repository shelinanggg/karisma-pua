import { useLocation } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PimpinanApprovalSKPView } from './PimpinanApprovalSKPView';
import { PimpinanApprovalKegiatanView } from './PimpinanApprovalKegiatanView';

export function PimpinanApprovalPegawaiView() {
  const location = useLocation();
  const defaultTab = (location.state as { tab?: string } | null)?.tab === 'pengajuan' ? 'pengajuan' : 'realisasi';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Persetujuan Pegawai</h1>
        <p className="mt-1 text-sm text-gray-500">Kelola realisasi kegiatan dan pengajuan target kegiatan pegawai.</p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full max-w-xl grid-cols-2">
          <TabsTrigger value="realisasi">Realisasi Kegiatan</TabsTrigger>
          <TabsTrigger value="pengajuan">Pengajuan Kegiatan</TabsTrigger>
        </TabsList>

        <TabsContent value="realisasi" className="mt-6">
          <PimpinanApprovalSKPView />
        </TabsContent>

        <TabsContent value="pengajuan" className="mt-6">
          <PimpinanApprovalKegiatanView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PimpinanApprovalPegawaiView;

import { TrendingUp, Calendar, Database, Lock } from 'lucide-react';
import { useMemo } from 'react';

const VaultStats = ({ vaultRecords = [], isLoading = false }) => {
  const stats = useMemo(() => {
    if (!vaultRecords || vaultRecords.length === 0) {
      return {
        totalVaults: 0,
        thisMonth: 0,
        totalStorage: 0,
        encrypted: 0,
        creationTrend: [],
        storageByMonth: [],
      };
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Count vaults created this month
    const thisMonth = vaultRecords.filter((vault) => {
      const vaultDate = new Date(vault.createdAt);
      return vaultDate.getMonth() === currentMonth && vaultDate.getFullYear() === currentYear;
    }).length;

    // Calculate total storage size (in MB)
    const totalStorage = vaultRecords.reduce((sum, vault) => sum + (vault.fileSize || 0), 0) / (1024 * 1024);

    // Count encrypted vaults (assuming all are encrypted)
    const encrypted = vaultRecords.length;

    // Get last 6 months trend
    const creationTrend = getLast6MonthsTrend(vaultRecords);
    const storageByMonth = getStorageByMonth(vaultRecords);

    return {
      totalVaults: vaultRecords.length,
      thisMonth,
      totalStorage: totalStorage.toFixed(2),
      encrypted,
      creationTrend,
      storageByMonth,
    };
  }, [vaultRecords]);

  return (
    <div className="space-y-5">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Database}
          label="Total Vaults"
          value={isLoading ? '-' : stats.totalVaults}
          tone="bg-[#1E6BFF]"
          textColor="text-white"
        />
        <StatCard
          icon={Calendar}
          label="This Month"
          value={isLoading ? '-' : stats.thisMonth}
          tone="bg-[#FFD600]"
          textColor="text-black"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Storage"
          value={isLoading ? '-' : `${stats.totalStorage}MB`}
          tone="bg-[#00E676]"
          textColor="text-black"
        />
        <StatCard
          icon={Lock}
          label="Encrypted"
          value={isLoading ? '-' : stats.encrypted}
          tone="bg-[#FFC0CB]"
          textColor="text-black"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Creation Trend Chart */}
        <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Analytics</p>
              <h3 className="mt-1 text-lg font-black uppercase italic">Vault Creation Trend</h3>
            </div>
            <TrendingUp size={24} strokeWidth={2.5} className="text-[#1E6BFF]" />
          </div>

          <div className="flex items-end gap-2">
            {stats.creationTrend.length === 0 ? (
              <div className="flex w-full items-center justify-center py-12 text-sm font-bold text-black/50">
                No data yet. Create some vaults to see trends.
              </div>
            ) : (
              stats.creationTrend.map((item, index) => (
                <div key={`trend-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-lg border-2 border-black bg-[#1E6BFF]"
                      style={{ height: `${Math.max(item.count * 20, 20)}px` }}
                    />
                  </div>
                  <span className="text-center text-[10px] font-black uppercase text-black/60">{item.month}</span>
                  <span className="text-xs font-bold text-black">{item.count}</span>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Storage Distribution Chart */}
        <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Storage</p>
              <h3 className="mt-1 text-lg font-black uppercase italic">Monthly Distribution</h3>
            </div>
            <Database size={24} strokeWidth={2.5} className="text-[#00E676]" />
          </div>

          <div className="flex items-end gap-2">
            {stats.storageByMonth.length === 0 ? (
              <div className="flex w-full items-center justify-center py-12 text-sm font-bold text-black/50">
                No data yet. Upload files to see storage distribution.
              </div>
            ) : (
              stats.storageByMonth.map((item, index) => (
                <div key={`storage-${index}`} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full">
                    <div
                      className="w-full rounded-t-lg border-2 border-black bg-[#00E676]"
                      style={{ height: `${Math.max(item.size * 5, 20)}px` }}
                    />
                  </div>
                  <span className="text-center text-[10px] font-black uppercase text-black/60">{item.month}</span>
                  <span className="text-[9px] font-bold text-black">{item.size.toFixed(1)}MB</span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Activity Summary */}
      <section className="rounded-2xl border-4 border-black bg-[#FFC0CB] p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Encryption Standard</p>
            <p className="mt-2 text-2xl font-black uppercase italic">AES-256-GCM</p>
            <p className="mt-1 text-xs font-bold text-black/60">Military-grade encryption</p>
          </div>
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Key Derivation</p>
            <p className="mt-2 text-2xl font-black uppercase italic">MELODIC</p>
            <p className="mt-1 text-xs font-bold text-black/60">Melody-based KDF</p>
          </div>
          <div className="rounded-xl border-[3px] border-black bg-white p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Processing</p>
            <p className="mt-2 text-2xl font-black uppercase italic">LOCAL</p>
            <p className="mt-1 text-xs font-bold text-black/60">Client-side only</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, tone, textColor }) => (
  <div className={`${tone} rounded-xl border-[3px] border-black p-4 shadow-[4px_4px_0_#0F172A]`}>
    <div className="flex items-center gap-3">
      <div className={`grid h-12 w-12 place-items-center rounded-lg ${tone === 'bg-[#1E6BFF]' || tone === 'bg-[#00E676]' ? 'bg-black/10' : 'bg-black/5'}`}>
        <Icon size={24} strokeWidth={2.5} className={textColor} />
      </div>
      <div className="flex-1">
        <p className={`text-xs font-black uppercase tracking-[0.12em] ${tone === 'bg-[#1E6BFF]' ? 'text-white/75' : 'text-black/60'}`}>{label}</p>
        <p className={`mt-1 text-2xl font-black uppercase italic ${textColor}`}>{value}</p>
      </div>
    </div>
  </div>
);

function getLast6MonthsTrend(vaultRecords) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const trend = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const count = vaultRecords.filter((vault) => {
      const vaultDate = new Date(vault.createdAt);
      return vaultDate.getMonth() === monthIndex && vaultDate.getFullYear() === year;
    }).length;

    trend.push({
      month: months[monthIndex],
      count: count || 0,
    });
  }

  return trend;
}

function getStorageByMonth(vaultRecords) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const storage = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthIndex = date.getMonth();
    const year = date.getFullYear();

    const size =
      vaultRecords
        .filter((vault) => {
          const vaultDate = new Date(vault.createdAt);
          return vaultDate.getMonth() === monthIndex && vaultDate.getFullYear() === year;
        })
        .reduce((sum, vault) => sum + (vault.fileSize || 0), 0) / (1024 * 1024);

    storage.push({
      month: months[monthIndex],
      size: size || 0,
    });
  }

  return storage;
}

export default VaultStats;

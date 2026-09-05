import { useEffect, useState } from 'react';
import { AlertCircle, FileArchive, RefreshCw, ShieldCheck } from 'lucide-react';
import { fetchVaultHistory } from '../../services/vaultAPI';

const formatBytes = (bytes) => {
  if (!bytes) return 'Size unavailable';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
};

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

const VaultHistory = () => {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      setRecords(await fetchVaultHistory());
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Could not load vault history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchVaultHistory()
      .then((history) => {
        if (isMounted) setRecords(history);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError?.response?.data?.message || 'Could not load vault history.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b-4 border-black pb-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Encrypted activity log</p>
          <h3 className="mt-1 text-2xl font-black uppercase italic">Locked file history</h3>
          <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-black/65">Metadata only. Your file contents, melody, and derived keys stay on your device.</p>
        </div>
        <button type="button" onClick={loadHistory} disabled={isLoading} className="inline-flex h-10 items-center gap-2 border-3 border-black bg-[#FFD600] px-3 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A] disabled:opacity-50">
          <RefreshCw size={16} strokeWidth={3} className={isLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-3 border-3 border-black bg-[#FFC0CB] p-4 text-sm font-black">
          <AlertCircle size={20} strokeWidth={3} /> {error}
        </div>
      )}

      {!error && isLoading && <p className="py-12 text-center text-sm font-black uppercase tracking-[0.16em]">Loading vault records...</p>}

      {!error && !isLoading && records.length === 0 && (
        <div className="mt-5 grid place-items-center border-3 border-dashed border-black bg-[#FDFBF7] px-5 py-14 text-center">
          <FileArchive size={34} strokeWidth={3} />
          <h4 className="mt-4 text-xl font-black uppercase italic">No locked files yet</h4>
          <p className="mt-2 max-w-md text-sm font-bold text-black/60">Your completed vault artifacts will appear here after the create flow sends their metadata.</p>
        </div>
      )}

      {!error && !isLoading && records.length > 0 && (
        <div className="mt-5 overflow-x-auto border-3 border-black">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead className="bg-[#1E6BFF] text-xs uppercase text-white">
              <tr>
                <th className="border-b-3 border-black p-3 font-black">File</th>
                <th className="border-b-3 border-black p-3 font-black">Status</th>
                <th className="border-b-3 border-black p-3 font-black">Protection</th>
                <th className="border-b-3 border-black p-3 font-black">Locked</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="border-b-2 border-black last:border-b-0 hover:bg-[#FFF4B8]">
                  <td className="p-3"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center border-2 border-black bg-[#00E676]"><FileArchive size={17} strokeWidth={3} /></span><span><strong className="block max-w-[230px] truncate text-sm font-black">{record.fileName}</strong><small className="font-bold text-black/55">{formatBytes(record.fileSize)}</small></span></div></td>
                  <td className="p-3"><span className="inline-flex items-center gap-1 border-2 border-black bg-[#00E676] px-2 py-1 text-[10px] font-black uppercase"><ShieldCheck size={13} strokeWidth={3} /> {record.status}</span></td>
                  <td className="p-3 text-sm font-bold">{record.algorithm || 'AES-256-GCM'}{record.melodyLength ? <small className="block text-xs text-black/55">{record.melodyLength} notes</small> : null}</td>
                  <td className="p-3 text-sm font-bold">{formatDate(record.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default VaultHistory;
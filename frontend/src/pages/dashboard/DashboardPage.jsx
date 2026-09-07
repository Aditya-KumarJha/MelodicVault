import { useMemo, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Camera,
  Check,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { MobileNav, SidebarContent } from './components/Navigation';
import { navItems } from './dashboardData';
import { SEO } from '../../components/seo';
import { updateProfile } from '../../services/authApi';
import { fetchVaultHistory } from '../../services/vaultApi';
import VaultUpload from './components/VaultUpload';
import VaultStats from './components/VaultStats';
import { setAuthUser } from '../../store/authSlice';
import { toast } from 'react-toastify';
import MidiKeyRecorder from './components/MidiKeyRecorder';
import UnlockVault from './UnlockVault';
import VaultHistory from './VaultHistory';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { view } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ firstName: '', lastName: '', username: '', profileImage: '' });
  const [vaultRecords, setVaultRecords] = useState([]);
  const [isLoadingVaults, setIsLoadingVaults] = useState(true);
  const authUser = useSelector((state) => state.auth.user);

  // Fetch vault history on component mount
  useEffect(() => {
    const loadVaultHistory = async () => {
      try {
        setIsLoadingVaults(true);
        const records = await fetchVaultHistory();
        setVaultRecords(records || []);
      } catch (error) {
        console.error('Failed to load vault history:', error);
        setVaultRecords([]);
      } finally {
        setIsLoadingVaults(false);
      }
    };
    loadVaultHistory();
  }, []);

  const validViewIds = navItems.map((item) => item.id);
  const activeView = validViewIds.includes(view) ? view : 'overview';
  const activeNavItem = navItems.find((item) => item.id === activeView);

  const displayName = useMemo(() => {
    const first = authUser?.fullName?.firstName;
    const last = authUser?.fullName?.lastName;
    return [first, last].filter(Boolean).join(' ') || authUser?.username || 'Vault user';
  }, [authUser]);

  const initials = useMemo(() => {
    return displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'MV';
  }, [displayName]);

  const savedProfile = {
    firstName: authUser?.fullName?.firstName || '',
    lastName: authUser?.fullName?.lastName || '',
    username: authUser?.username || '',
    profileImage: authUser?.profilePic || '',
  };
  const profileChanged = Object.keys(savedProfile).some((key) => profileDraft[key] !== savedProfile[key]);

  const selectView = (nextView) => {
    navigate(`/dashboard/${nextView}`);
    setMobileSidebarOpen(false);
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile image cannot exceed 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setProfileDraft((draft) => ({ ...draft, profileImage: reader.result }));
    reader.onerror = () => toast.error('Could not read image');
    reader.readAsDataURL(file);
  };

  const resetProfileDraft = () => setProfileDraft(savedProfile);

  const toggleProfileEditor = () => {
    if (!isProfileOpen) resetProfileDraft();
    setIsProfileOpen((open) => !open);
  };

  const handleProfileSave = async () => {
    setIsSavingProfile(true);
    try {
      const payload = {
        fullName: { firstName: profileDraft.firstName.trim(), lastName: profileDraft.lastName.trim() },
        username: profileDraft.username.trim(),
      };
      if (profileDraft.profileImage !== savedProfile.profileImage) payload.profileImage = profileDraft.profileImage;
      const user = await updateProfile(payload);
      dispatch(setAuthUser(user));
      localStorage.setItem('user', JSON.stringify(user));
      setIsProfileOpen(false);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message || 'Profile update failed');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <>
      <SEO
        title={`${activeNavItem?.label || 'Dashboard'} | Melodic Vault`}
        description="Private Melodic Vault user dashboard for melody-based file encryption workflows."
        noIndex
      />
      <main
        className="h-screen overflow-hidden bg-[#1E6BFF] font-sans text-slate-950"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      >
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-70 border-r-4 border-black bg-[#00E676] p-5 shadow-[10px_0_0_#0A0C10] transition-transform lg:hidden ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'
          }`}
        >
          <SidebarContent activeView={activeView} onClose={() => setMobileSidebarOpen(false)} onViewChange={selectView} />
        </aside>

        <MobileNav activeView={activeView} onViewChange={selectView} />

        <div className={`grid h-screen overflow-hidden transition-[grid-template-columns] duration-300 ${sidebarOpen ? 'lg:grid-cols-[280px_minmax(0,1fr)]' : 'lg:grid-cols-[92px_minmax(0,1fr)]'}`}>
          <aside className="hidden h-screen overflow-hidden border-r-4 border-black bg-[#00E676] p-5 shadow-[8px_0_0_#0A0C10] lg:block">
            <SidebarContent
              activeView={activeView}
              compact={!sidebarOpen}
              onClose={() => setSidebarOpen(false)}
              onOpen={() => setSidebarOpen(true)}
              onViewChange={selectView}
            />
          </aside>

          <section className="flex h-screen min-w-0 flex-col overflow-hidden">
            <header className="z-30 shrink-0 border-b-4 border-black bg-white/92 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    className="grid h-11 w-11 place-items-center rounded-2xl border-[3px] border-black bg-[#FFD600] font-black italic text-black shadow-[4px_4px_0_#0F172A] lg:hidden"
                    onClick={() => setMobileSidebarOpen(true)}
                    aria-label="Open sidebar"
                  >
                    <Menu size={20} strokeWidth={3} />
                  </button>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1E6BFF]">Melodic Vault</p>
                    <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{activeNavItem?.label || 'Overview'}</h1>
                  </div>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleProfileEditor}
                    aria-expanded={isProfileOpen}
                    className="flex items-center gap-2 rounded-xl border-[3px] border-black bg-[#FFD600] px-2 py-1.5 text-xs font-black uppercase shadow-[3px_3px_0_#0F172A]"
                  >
                  {authUser?.profilePic ? (
                    <img
                      src={authUser.profilePic}
                      alt={displayName}
                      className="h-8 w-8 rounded-lg border-2 border-black object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="grid h-8 w-8 place-items-center rounded-lg border-2 border-black bg-white">
                      {initials}
                    </span>
                  )}
                    <span>{displayName}</span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-[calc(100%+12px)] z-40 w-[min(92vw,390px)] rounded-xl border-4 border-black bg-[#FDFBF7] p-4 shadow-[7px_7px_0_#0F172A]">
                      <div className="flex items-start justify-between gap-3 border-b-4 border-black pb-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Profile settings</p>
                          <h2 className="mt-1 text-xl font-black uppercase italic">Your operator profile</h2>
                        </div>
                        <button type="button" onClick={() => { resetProfileDraft(); setIsProfileOpen(false); }} className="grid h-9 w-9 place-items-center border-2 border-black bg-white" aria-label="Close profile settings">
                          <X size={18} strokeWidth={3} />
                        </button>
                      </div>

                      <div className="mt-4 flex items-center gap-3">
                        {profileDraft.profileImage ? (
                          <img src={profileDraft.profileImage} alt="Profile preview" className="h-16 w-16 rounded-lg border-3 border-black object-cover" />
                        ) : (
                          <span className="grid h-16 w-16 place-items-center rounded-lg border-3 border-black bg-[#FFD600] text-lg font-black">{initials}</span>
                        )}
                        <label className="inline-flex h-10 cursor-pointer items-center gap-2 border-3 border-black bg-[#00E676] px-3 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A]">
                          <Camera size={16} strokeWidth={3} /> Change photo
                          <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={handleProfileImageChange} disabled={isSavingProfile} />
                        </label>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        {[
                          ['First name', 'firstName'],
                          ['Last name', 'lastName'],
                          ['Username', 'username'],
                        ].map(([label, key]) => (
                          <label key={key} className={`grid min-w-0 gap-1 text-xs font-black uppercase italic ${key === 'username' ? 'sm:col-span-2' : ''}`}>
                            {label}
                            <input
                              value={profileDraft[key]}
                              onChange={(event) => setProfileDraft((draft) => ({ ...draft, [key]: event.target.value }))}
                              className="box-border h-10 w-full min-w-0 border-3 border-black bg-white px-2 text-sm font-bold normal-case outline-none focus:bg-[#FFF4B8]"
                              maxLength={key === 'username' ? 20 : 50}
                            />
                          </label>
                        ))}
                      </div>

                      <div className="mt-4 flex justify-end gap-2 border-t-4 border-black pt-3">
                        <button type="button" onClick={() => { resetProfileDraft(); setIsProfileOpen(false); }} className="inline-flex h-10 items-center gap-2 border-3 border-black bg-white px-3 text-xs font-black uppercase italic">
                          <X size={15} strokeWidth={3} /> Cancel
                        </button>
                        <button type="button" onClick={handleProfileSave} disabled={!profileChanged || !profileDraft.firstName.trim() || !profileDraft.lastName.trim() || isSavingProfile} className="inline-flex h-10 items-center gap-2 border-3 border-black bg-[#00E676] px-3 text-xs font-black uppercase italic shadow-[3px_3px_0_#0F172A] disabled:cursor-not-allowed disabled:opacity-40">
                          <Check size={15} strokeWidth={3} /> {isSavingProfile ? 'Saving...' : 'Save changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </header>

            <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-24 lg:pb-0">
              <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:px-8">
                {activeView === 'history' ? (
                  <VaultHistory />
                ) : (
                  <>
                  {activeView === 'overview' && (
                    <VaultStats vaultRecords={vaultRecords} isLoading={isLoadingVaults} />
                  )}
                {activeView === 'create' && (
                  <VaultUpload />
                )}
                {activeView === 'unlock' && (
                  <UnlockVault />
                )}
                {activeView === 'settings' && (
                  <section className="rounded-2xl border-4 border-black bg-white p-5 shadow-[7px_7px_0_#0F172A] sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#1E6BFF]">Profile settings</p>
                    <h3 className="mt-1 text-2xl font-black uppercase italic">Edit your operator profile</h3>
                    <p className="mt-2 text-sm font-bold text-black/65">Click your profile chip in the top-right corner to update your name, username, or picture.</p>
                  </section>
                )}
                {activeView === 'melody' && (
                  <MidiKeyRecorder />
                )}
                <section className="rounded-2xl border-4 border-black bg-black p-5 text-white shadow-[7px_7px_0_#0F172A]">
                  <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)] md:items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-xl border-[3px] border-white bg-[#00E676] text-black">
                      <ShieldCheck size={26} strokeWidth={3} />
                    </span>
                    <div>
                      <h3 className="text-xl font-black uppercase italic">MVP reminder</h3>
                      <p className="mt-2 max-w-4xl text-sm font-bold leading-6 text-white/72">
                        Build the real create/decrypt flows next, but keep the rule firm: plaintext files, raw melodies, and derived keys never move to the server.
                      </p>
                    </div>
                  </div>
                </section>
                  </>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default DashboardPage;

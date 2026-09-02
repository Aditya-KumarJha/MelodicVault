import { API_BASE_URL } from '../../services/apiConfig';

const GitHubMark = () => (
  <svg aria-hidden="true" className="h-6 w-6 shrink-0" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
  </svg>
);

const GoogleMark = () => (
  <span
    aria-hidden="true"
    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-xl font-black not-italic leading-none"
    style={{
      backgroundImage: 'conic-gradient(from -45deg, #4285F4 0 25%, #34A853 0 50%, #FBBC05 0 75%, #EA4335 0)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    }}
  >
    G
  </span>
);

const SocialLogin = ({ mode = 'signin' }) => {
  const suffix = mode === 'signup' ? '/signup' : '';

  const continueWithGoogle = () => {
    window.location.assign(`${API_BASE_URL}/api/auth/google${suffix}`);
  };

  const continueWithGithub = () => {
    window.location.assign(`${API_BASE_URL}/api/auth/github${suffix}`);
  };

  return (
    <div>
      <button
        type="button"
        onClick={continueWithGoogle}
        className="mb-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md border-[3px] border-black bg-white px-3 text-sm font-black uppercase italic shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 sm:h-13"
      >
        <GoogleMark />
        <span className="truncate">Continue with Google</span>
      </button>

      <button
        type="button"
        onClick={continueWithGithub}
        className="mb-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-md border-[3px] border-black bg-white px-3 text-sm font-black uppercase italic shadow-[3px_3px_0_#000] transition-transform hover:-translate-y-0.5 sm:h-13"
      >
        <GitHubMark />
        <span className="truncate">Continue with GitHub</span>
      </button>

      <div className="mb-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-[10px] font-black uppercase italic tracking-[0.16em] text-black/45">
        <span className="h-0.75 bg-black/15" />
        <span>{mode === 'signup' ? 'Sign up with email' : 'Sign in with email'}</span>
        <span className="h-0.75 bg-black/15" />
      </div>
    </div>
  );
};

export default SocialLogin;

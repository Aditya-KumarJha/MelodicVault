import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from './AuthLayout';
import AuthPanel from './AuthPanel';
import FormField from './FormField';
import { checkAuthUser, loginUser, refreshToken, setUserEmail } from '../../store/authSlice';
import { setCurrentUser } from '../../services/authApi';
import { SEO } from '../../components/seo';

import SocialLogin from './SocialLogin';
import { toast } from 'react-toastify';
import OtpVerificationPage from './OtpVerificationPage';

const SignInPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isOtpRequired } = useSelector(state => state.auth);


  const params = new URLSearchParams(location.search);
  const auth = params.get('auth');
  const oauthError = params.get('error') || '';
  const displayError = error || oauthError;

  useEffect(() => {
    if (oauthError) return;
    if (auth === 'success') {
      (async () => {
        try {
          let response;
          try {
            response = await dispatch(checkAuthUser()).unwrap();
          } catch {
            await dispatch(refreshToken()).unwrap();
            response = await dispatch(checkAuthUser()).unwrap();
          }

          const user = response?.user || response?.data?.user;
          if (user) {
            setCurrentUser(user);
          }
          toast.success('Signed in successfully');
          navigate('/dashboard/overview', { replace: true });
        } catch (err) {
          const message = err?.message || err?.data?.message || 'Session verification failed. Please sign in again.';
          setError(message);
        }
      })();
    }
  }, [auth, dispatch, navigate, oauthError]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.target);
    const email = formData.get('email')?.trim().toLowerCase();
    const password = formData.get('password');

    const payload={
      email,password
    }

    try {
      const response = await dispatch(loginUser(payload)).unwrap();
      toast.success(response?.message)
      dispatch(setUserEmail(email))
      
     
    } catch (err) {
      console.error("Caught error:", err);

      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors[0].message);
        toast.error(err.errors[0].message)
      } 

      else if (err?.message) {
        setError(err.message);
      } 

      else {
        setError(typeof err === 'string' ? err : 'Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  

if (isOtpRequired) {
    return <OtpVerificationPage />;
}

  return (
    <>
      <SEO
            title="Sign In Via Email"
        description="Sign in to your Melodic Vault account to manage secure melody-based vault workflows."
        noIndex
      />
      <AuthLayout
        eyebrow="Vault login"
        title="Enter The Vault"
        subtitle="Authenticate first, then lock and unlock encrypted files with your melody and timing pattern."
      >
        <AuthPanel
          footerHref="/signup"
          footerLabel="Create account"
          footerText="New vault user?"
          icon={ShieldCheck}
          onSubmit={handleSubmit}
          title="Sign In"
        >
          <SocialLogin mode="signin" />
          <div className="grid gap-4">
            {displayError && (
              <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                {displayError}
              </div>
            )}
            <FormField autoComplete="email" icon={Mail} label="Email" name="email" placeholder="you@example.com" type="email" />
            <FormField
              autoComplete="current-password"
              icon={LockKeyhole}
              label="Password"
              name="password"
              placeholder="Access key"
              type="password"
            />

            <div className=" flex-col gap-3 text-sm font-black flex sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2">
                <input className="h-5 w-5 accent-[#00E676]" type="checkbox" />
                Remember this browser
              </label>
              <Link to="/reset-password" className="uppercase italic text-[#1E6BFF] underline decoration-[3px] underline-offset-4 ">
                Recover account
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-1 inline-flex h-12 min-w-0 items-center justify-between gap-3 border-[3px] border-black bg-[#00E676] px-3 text-sm
              font-black uppercase italic shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5
              cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed sm:mt-2 sm:h-13 sm:border-4 sm:px-4 sm:text-base sm:shadow-[6px_6px_0_#000]"
            >
              <span className="truncate">{isLoading ? 'Signing in...' : 'Sign in'}</span>
              <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </AuthPanel>
      </AuthLayout>
    </>
  );
};

export default SignInPage;

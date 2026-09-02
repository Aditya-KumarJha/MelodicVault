import { useState } from 'react';
import { ArrowRight, LockKeyhole, Mail, UserRoundPlus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import AuthLayout from './AuthLayout';
import AuthPanel from './AuthPanel';
import FormField from './FormField';
import { registerUser, setUserEmail } from '../../store/authSlice';
import SocialLogin from './SocialLogin';
import { toast } from 'react-toastify';
import OtpVerificationPage from './OtpVerificationPage';
import { SEO } from '../../components/seo';

const SignUpPage = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isOtpRequired } = useSelector(state => state.auth);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.target);
    const firstName = formData.get('firstname')?.trim();
    const lastName = formData.get('lastname')?.trim();
    const email = formData.get('email')?.trim().toLowerCase();
    const username = formData.get('username')?.trim().toLowerCase();
    const password = formData.get('password');

    const payload = {
      email: email,
      password: password,
      fullName: {
        firstName,
        lastName,
      },
      ...(username ? { username } : {}),
    };

    try {
      const response = await dispatch(registerUser(payload)).unwrap();
      toast.success(response?.message || "OTP sent to your email");
      dispatch(setUserEmail(email));
      

    } catch (err) {
      console.error("Caught error:", err);
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors[0].message);
      } else if (err?.message) {
        setError(err.message);
      } else {
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
        title="Create Account"
        description="Create a Melodic Vault account for melody and rhythm based file encryption."
        noIndex
      />
      <AuthLayout
        eyebrow="Account setup"
        title="Create Your Vault"
        subtitle="Create your account first. Melody secrets and encryption keys stay out of the backend."
      >
        <AuthPanel
          footerHref="/signin"
          footerLabel="Sign in"
          footerText="Already registered?"
          icon={UserRoundPlus}
          onSubmit={handleSubmit}
            title="Sign Up Via Email"
          mode="signup"
        >
          <SocialLogin mode="signup" />
          <div className="grid gap-4">
            {error && (
              <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField autoComplete="given-name" icon={UserRoundPlus} label="First name" name="firstname" placeholder="First" />
              <FormField autoComplete="family-name" icon={UserRoundPlus} label="Last name" name="lastname" placeholder="Last" />
            </div>

            <FormField autoComplete="email" icon={Mail} label="Email" name="email" placeholder="you@example.com" type="email" />
            <FormField autoComplete="username" icon={UserRoundPlus} label="Username" name="username" placeholder="optional_handle" />
            
            <FormField
              autoComplete="new-password"
              icon={LockKeyhole}
              label="Password"
              name="password"
              placeholder="Create access key"
              type="password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="group mt-1 inline-flex h-12 cursor-pointer min-w-0 items-center justify-between gap-3 border-[3px] border-black bg-[#FFD600] px-3 text-sm font-black uppercase italic shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-2 sm:h-13 sm:border-4 sm:px-4 sm:text-base sm:shadow-[6px_6px_0_#000]"
            >
              <span className="truncate">{isLoading ? 'Creating...' : 'Create account'}</span>
              <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </AuthPanel>
      </AuthLayout>
    </>
  );
};

export default SignUpPage;

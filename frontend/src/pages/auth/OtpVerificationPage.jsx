import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail } from 'lucide-react';

import AuthLayout from './AuthLayout';
import AuthPanel from './AuthPanel';
import OtpField from './OtpField';
import { resendOtp, resetAuthState, verifyLoginOtp, verifyRegisterOtp } from '../../store/authSlice';
import { setCurrentUser } from '../../services/authApi';
import { toast } from 'react-toastify';
import { SEO } from '../../components/seo';

const OtpVerificationPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const { userEmail, authType } = useSelector((state) => state.auth);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const missingSession = !userEmail || !authType;

    const handleAccountVerification = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError('');

        const formData = new FormData(event.target);
        const otp = formData.get('otp')?.trim();

        try {
            const payload = {
                email: userEmail,
                otp: otp,
            };

            const actionToCall = authType === 'login' ? verifyLoginOtp : verifyRegisterOtp;

            const response = await dispatch(actionToCall(payload)).unwrap();
    

            if (response?.data?.user) {
                setCurrentUser(response?.data?.user);
            }
            toast.success(response?.message || 'Verified successfully');
            navigate('/dashboard/overview');

        } catch (err) {
            console.error('Verification failed:', err);
            if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                setError(err.errors[0].message);
            } else if (typeof err === 'string') {
                setError(err);
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('Verification failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleResendOtp = async () => {
      try{
        if (!userEmail || !authType) {
          navigate('/signin');
          return;
        }

        const purpose = authType === 'login' ? 'login' : 'register';
        const response = await dispatch(resendOtp({ purpose, email: userEmail })).unwrap();
        toast.success(response.message || 'OTP resent successfully!');
      }catch(err){
   console.error('Verification failed:', err);
            
            if (typeof err === 'string') {
                setError(err);
            } else if (err?.message) {
                setError(err.message);
            } else {
                setError('Verification failed. Please try again.');
            }
      }

    } 

    return (
      <>
        <SEO
          title="OTP Verification"
          description="Verify your Melodic Vault sign-in with a one-time passcode."
          noIndex
        />
        <AuthLayout
          eyebrow="Security verification"
          title="Confirm Vault Access"
          subtitle="Enter the one-time passcode sent to your email to complete authentication."
        >
          <AuthPanel
            footerHref={authType === 'login' ? '/signup' : '/signin'}
            footerLabel={authType === 'login' ? 'Create account' : 'Sign in'}
            footerText={authType === 'login' ? 'New vault user?' : 'Already registered?'}
            icon={Mail}
            onSubmit={handleAccountVerification}
            title="OTP Verification"
            mode="signin"
          >
            <div className="grid gap-4">
              {missingSession && (
                <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                  OTP session expired. Please sign in again.
                </div>
              )}

              {!missingSession && error && (
                <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                  {error}
                </div>
              )}

              <OtpField
                name="otp"
                autoComplete="one-time-code"
                label="Enter OTP"
                placeholder="6-digit code"
                icon={LockKeyhole}
              />

              <button
                type="submit"
                disabled={isLoading || missingSession}
                className="group mt-1 inline-flex h-12 min-w-0 items-center justify-between gap-3 border-[3px] border-black bg-[#FFD600] px-3 text-sm font-black uppercase italic shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-2 sm:h-13 sm:border-4 sm:px-4 sm:text-base sm:shadow-[6px_6px_0_#000]"
              >
                <span className="truncate">{isLoading ? 'Verifying...' : 'Verify OTP'}</span>
                <ArrowRight size={20} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="uppercase italic text-[#1E6BFF] underline decoration-[3px] underline-offset-4"
                >
                  Resend OTP
                </button>
              </div>
            </div>
          </AuthPanel>
        </AuthLayout>
      </>
    );
};

export default OtpVerificationPage;

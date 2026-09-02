import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import AuthLayout from './AuthLayout';
import AuthPanel from './AuthPanel';
import FormField from './FormField';
import { useDispatch } from 'react-redux';
import { forgotPassword, resendOtp, resetPassword, verifyForgotPasswordOtp } from '../../store/authSlice';
import { toast } from 'react-toastify';
import { SEO } from '../../components/seo';

const RecoverPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [step, setStep] = useState(1);
  
  
  const [email, setEmail] = useState('');
  
  const dispatch = useDispatch();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const formData = new FormData(event.currentTarget);

      if (step === 1) {
        const enteredEmail = formData.get('email')?.trim().toLowerCase();
        setEmail(enteredEmail);

       
        const response = await dispatch(forgotPassword({ email: enteredEmail })).unwrap();// await
     
        toast.success(response?.message || "Otp sent to your email")

        setStep(2);
     

      } else if (step === 2) {
        const enteredOtp = formData.get('otp')?.trim();

       
        const response = await dispatch(verifyForgotPasswordOtp({ email, otp: enteredOtp })).unwrap();
        toast.success(response?.message || "You can reset your password")
        
        setStep(3);

      } else if (step === 3) {
        const newPassword = formData.get('password')?.trim();
        const confirmPassword = formData.get('confirmPassword')?.trim();
        

        if (newPassword !== confirmPassword) {
          setError('Passwords do not match.');
          setIsLoading(false);
          return;
        }

        const response = await dispatch(resetPassword({ email, newPassword })).unwrap();
       toast.success(response?.message || "Password reset successfully! login to your account.")
        navigate('/signin');
      }
    } catch (err) {
      console.error('Caught error:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    if (step === 1) return 'Recover Password';
    if (step === 2) return 'Verify OTP';
    return 'Reset Password';
  };

  const handleResendOtp = async()=> {
      try{
          const response =  await dispatch(resendOtp({purpose:"forgot", email})).unwrap()
        toast.success(response.message || "Otp resent successfully!")
      }catch(err){
   console.error("Caught error:", err);

      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        setError(err.errors[0].message);
      } 

      else if (err?.message) {
        setError(err.message);
      } 

      else {
        setError(typeof err === 'string' ? err : 'Registration failed');
      }
      }

    } 

  return (
    <>
      <SEO
        title="Recover Password"
        description="Recover access to your Melodic Vault account using secure OTP verification."
        noIndex
      />
      <AuthLayout
        eyebrow="Operator Security"
        title={step === 1 ? 'Recover Access' : step === 2 ? 'Security Verification' : 'Set New Access Key'}
        subtitle={
          step === 1
            ? 'Enter your operator email to receive the secure access recovery OTP.'
            : step === 2
            ? 'Enter the OTP sent to your email to verify your identity.'
            : 'Keep the command center secure: update your credentials with a new secure password.'
        }
      >
        <AuthPanel
          footerHref="/signin"
          footerLabel="Sign in"
          footerText="Remember your password?"
          icon={ShieldCheck}
          onSubmit={handleSubmit}
          title={getTitle()}
        >
          <div className="grid gap-4">
            {error && (
              <div className="rounded border-2 border-red-500 bg-red-50 p-3 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

        
          {step === 1 && (
            <FormField
              autoComplete="email"
              icon={Mail}
              label="Email"
              name="email"
              placeholder="you@example.com"
              type="email"
            />
          )}

        
          {step === 2 && (
           <>

           <FormField
              autoComplete="one-time-code"
              icon={LockKeyhole}
              label="Enter OTP"
              name="otp"
              placeholder="Enter your verification code"
              type="text"
            />
           <div className='w-full flex justify-end'>
                    <button
                  type='button' 
                  onClick= {handleResendOtp}
                   className="uppercase italic text-[#1E6BFF] underline decoration-[3px] underline-offset-4  ">
              Resend otp
            </button>
                    </div></> 
          )}

        
          {step === 3 && (
            <>
              <FormField
                autoComplete="new-password"
                icon={LockKeyhole}
                label="New Password"
                name="password"
                placeholder="Enter new access key"
                type="password"
              />

              <FormField
                autoComplete="new-password"
                icon={LockKeyhole}
                label="Confirm Password"
                name="confirmPassword"
                placeholder="Confirm new access key"
                type="password"
              />
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group mt-1 inline-flex h-12 min-w-0 items-center justify-between gap-3 border-[3px] border-black bg-[#00E676] px-3 text-sm font-black uppercase italic shadow-[4px_4px_0_#000] transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-2 sm:h-13 sm:border-[4px] sm:px-4 sm:text-base sm:shadow-[6px_6px_0_#000]"
          >
            <span className="truncate">
              {step === 1
                ? isLoading
                  ? 'Sending...'
                  : 'Send OTP'
                : step === 2
                ? isLoading
                  ? 'Verifying...'
                  : 'Verify OTP'
                : isLoading
                ? 'Resetting...'
                : 'Reset Password'}
            </span>
            <ArrowRight
              size={20}
              strokeWidth={3}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
          </div>
        </AuthPanel>
      </AuthLayout>
    </>
  );
};

export default RecoverPassword;

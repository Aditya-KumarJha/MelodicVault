import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { resetAuthState } from '../../store/authSlice';


const AuthPanel = ({ children, footerHref, footerLabel, footerText, icon: Icon, onSubmit, title }) => {
 
const  navigate =useNavigate()
const dispatch = useDispatch()
  const handleNavigate = ()=>{
    dispatch(resetAuthState());
navigate(footerHref)
  }
  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border-[3px] border-black bg-white shadow-[5px_5px_0_#000] sm:max-w-[30rem] sm:border-[4px] sm:shadow-[9px_9px_0_#000]"
    >
      <div className=" items-center justify-between border-b-[4px] border-black bg-black p-3 text-white flex">
        <div className="flex gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FF5F56]" />
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#FFBD2E]" />
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white bg-[#00E676]" />
        </div>
        <span className="text-[10px] font-black uppercase italic tracking-[0.18em]">Secure_Window</span>
      </div>

      <div className="bg-[#FDFBF7] p-4 sm:p-6 ">
        <div className="mb-5 hidden items-center gap-3 sm:flex">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border-[3px] border-black bg-[#00E676] shadow-[4px_4px_0_#000]">
            <Icon size={22} strokeWidth={3} />
          </span>
          <h2 className="text-2xl font-black uppercase italic leading-none sm:text-3xl">{title}</h2>
        </div>

        

        <div className="rounded-lg border-[3px] border-black bg-white p-3 sm:p-4 ">{children}</div>
      </div>

      <div className="border-t-[3px] border-black bg-white p-3 text-center text-sm font-black sm:border-t-[4px] sm:p-4">
        <span className="text-black/60">{footerText}</span>{' '}
        <button type='button' onClick={handleNavigate} className="uppercase italic text-[#1E6BFF] underline decoration-[3px] underline-offset-4 cursor-pointer hover:text-[#082c6d]">
          {footerLabel}
        </button>
      </div>
    </form>
  );
};

export default AuthPanel;

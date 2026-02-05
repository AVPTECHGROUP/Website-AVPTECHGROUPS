import { Camera, SquarePenIcon, TriangleAlert, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const WarningVerificationFailed = () => {
  const navigate=useNavigate()
  return (
    <div className='flex h-screen overflow-hidded'>
      <div className='flex-1 flex w-full overflow-hidden flex-col'>
        <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative'>
            {/* Header */}
            <div className='mb-6'>
              <div className='flex items-center gap-2 mb-2 flex-col justify-center'>
                <div className='w-23 h-23 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <TriangleAlert fill='#e0b21c' color='#fef9c2' size={75} />
                </div>
                <h2 className='text-2xl font-bold text-gray-900'>Verification Failed</h2>
                <p className='text-sm text-red-500 font-bold'>
                  Attempt 3 of 3 failed
                </p>
                <p className='text-center text-gray-500 px-11'>We couldn't verify your identity using face
                  recognition after 3 attempts. You can now request
                  a manual attendance marking from your
                  administrator.</p>
                <div>
                </div>
              </div>
            </div>
  
            {/* Action Buttons */}
            <div className='space-y-3'>
              <button
                onClick={()=>navigate('/teachers/camera/manual')}
                className='w-full bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl'
              >
                <SquarePenIcon className='w-5 h-5' />
                Raise request to Mark Attendance
              </button>
              
            </div>

            {/* Privacy Notice */}
            <div className='mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
              <div className='w-4 h-4 shrink-0 mt-0.5'>
                <svg viewBox="0 0 24 24" fill="currentColor" className='text-gray-400'>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <div  className='flex gap-1'>
                <strong className='text-sm'>Having trouble?</strong><p className='text-blue-600 text-sm cursor-pointer font-medium'>Contact System Administrator</p>
              </div>  
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WarningVerificationFailed
import { useEffect, useState } from "react"
import {
  holidays,
  leave_request,
  login_page,
  parent_attendance,
  parent_dashboard,
  parent_transport,
  teacher_dashboard,
  teacher_exam,
  teacher_homework,
  teacher_profile,
} from "../../../assets/Images/Mockups"

const mobileImgs = [
  parent_dashboard,
  parent_attendance,
  teacher_dashboard,
  teacher_exam,
  teacher_homework,
  teacher_profile,
  parent_transport,
  holidays,
  leave_request,
  login_page,
]

export default function PhoneMockup() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % mobileImgs.length)
    }, 2200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: '9 / 22' }}
    >
      {mobileImgs.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="mobile"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  )
}
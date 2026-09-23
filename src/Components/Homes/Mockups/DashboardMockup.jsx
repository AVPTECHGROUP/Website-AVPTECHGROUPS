import { useEffect, useState } from "react"
import {
  attendance,
  dashboard,
  stock,
  student_enrolment,
  teachers,
  transport,
  users,
} from "../../../assets/Images/Mockups"

const laptopImgs = [
  dashboard,
  attendance,
  stock,
  student_enrolment,
  teachers,
  transport,
  users,
]

export default function DashboardMockup() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % laptopImgs.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ aspectRatio: '8 / 5' }}
    >
      {laptopImgs.map((img, i) => (
        <img
          key={i}
          src={img}
          alt="dashboard"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
    </div>
  )
}
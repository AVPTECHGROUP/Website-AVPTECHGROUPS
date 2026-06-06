import React, { useEffect, useState } from 'react'
import { GraduationCap, IndianRupee, CalendarCheck, Users, BookOpen, UserCheck, Package } from 'lucide-react'

const roles = [
    { text: "School Management Software", icon: GraduationCap },
    { text: "Fee Management Software", icon: IndianRupee },
    { text: "Attendance Management System", icon: CalendarCheck },
    { text: "Teacher Management System", icon: Users },
    { text: "School ERP Software", icon: BookOpen },
    { text: "Student Management System", icon: UserCheck },
    { text: "Stock Management System", icon: Package },
]

const Text_animate = () => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [displayed, setDisplayed] = useState('')
    const [isDeleting, setIsDeleting] = useState(false)

    const CurrentIcon = roles[currentIndex].icon

    useEffect(() => {
        const fullText = roles[currentIndex].text

        const timeout = setTimeout(() => {
            if (!isDeleting) {
                const next = fullText.slice(0, displayed.length + 1)
                setDisplayed(next)
                if (next === fullText) {
                    setTimeout(() => setIsDeleting(true), 1500)
                }
            } else {
                const next = fullText.slice(0, displayed.length - 1)
                setDisplayed(next)
                if (next === '') {
                    setIsDeleting(false)
                    setCurrentIndex((prev) => (prev + 1) % roles.length)
                }
            }
        }, isDeleting ? 40 : 80)

        return () => clearTimeout(timeout)
    }, [displayed, isDeleting, currentIndex])

    // har word alag span me — naya word bada aake normal hoga
    const words = displayed.split(' ')

    return (
        <div className="flex items-center gap-2 mt-3 h-8">
            <CurrentIcon size={20} className="text-white/80 shrink-0" />
            <p className="font-mono text-xl font-semibold flex gap-1.5 flex-wrap text-white/90 drop-shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
                {words.map((word, i) => (
                    <span
                        key={i}
                        style={{
                            display: 'inline-block',
                            animation: 'wordPop 0.3s ease forwards',
                        }}
                    >
                        {word}
                    </span>
                ))}
            </p>
        </div>
    )
}

export default Text_animate
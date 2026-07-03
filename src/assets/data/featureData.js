// src/assets/data/featureData.js

// 1. Import the images correctly (Note the capital 'I' and 'F' from your directory)
import studentImg from "../Images/Features/Student_Management.png";
import geoImg from "../Images/Features/Geo_Attendance.png";
import feeImg from "../Images/Features/Fee_Management.png";
import examImg from "../Images/Features/ExamManagement.png";
import transportImg from "../Images/Features/Transport.png";
import staffImg from "../Images/Features/Staff_Management.png";
import parentImg from "../Images/Features/ParentApp.png";
import storeImg from "../Images/Features/StoreManagement.png";

export const featureData = {
  "student-management": {
    icon: "GraduationCap",
    title: "Student Management",
    heading: "Manage the Complete Student Lifecycle",
    bgImage: studentImg,
    description:
      "SchoolSpine's Student Management module helps schools manage every stage of a student's journey from admission to graduation through one centralized platform. Store student profiles, academic records, attendance, documents, and performance reports securely in one place.",
    features: [
      "Online Admissions",
      "Student Profiles",
      "Attendance Management",
      "Academic Records",
      "Performance Tracking",
      "Parent Communication",
      "Secure Cloud Storage"
    ],
    benefits: [
      "Paperless administration",
      "Faster student search",
      "Accurate records",
      "Better parent engagement"
    ],
    footer: "Ready to simplify student management? Request a free demo today.",
  },

  "geo-attendance": {
    icon: "CalendarCheck",
    title: "Geo Attendance",
    heading: "Smart Attendance with Live Location",
    bgImage: geoImg,
    description:
      "Track staff attendance accurately using GPS-based geo attendance. Employees can mark attendance only from authorized locations while administrators receive real-time attendance reports.",
    features: [
      "GPS Location Tracking",
      "Geo-Fencing",
      "Check-In & Check-Out",
      "Live Attendance Reports",
      "Mobile Attendance",
      "Leave Integration"
    ],
    benefits: [
      "Prevent proxy attendance",
      "Accurate working hours",
      "Real-time monitoring",
      "Easy attendance reports"
    ],
    footer: "Monitor attendance smarter with SchoolSpine.",
  },

  "fee-billing": {
    icon: "Wallet",
    title: "Fee & Billing",
    heading: "Simplify School Fee Management",
    bgImage: feeImg,
    description:
      "Manage fee collection, invoices, receipts, concessions, scholarships, and online payments from one dashboard. Automate reminders and reduce manual accounting work.",
    features: [
      "Online Fee Collection",
      "Payment Gateway",
      "Automatic Receipts",
      "Due Reminders",
      "Fine Calculation",
      "Financial Reports"
    ],
    benefits: [
      "Faster fee collection",
      "Reduced paperwork",
      "Transparent accounting",
      "Better financial tracking"
    ],
    footer: "Manage school finances with confidence.",
  },

  "exam-management": {
    icon: "FileBarChart",
    title: "Exam Management",
    heading: "Digitize Your Examination Process",
    bgImage: examImg,
    description:
      "Create exam schedules, manage marks, generate report cards, and analyze student performance with a fully digital examination system.",
    features: [
      "Exam Scheduling",
      "Marks Entry",
      "Grade Calculation",
      "Report Cards",
      "Performance Analytics",
      "Result Publishing"
    ],
    benefits: [
      "Faster result processing",
      "Error-free grading",
      "Better academic insights",
      "Easy report generation"
    ],
    footer: "Make examinations faster and smarter.",
  },

  "transport-management": {
    icon: "Bus",
    title: "Transport Management",
    heading: "Efficient School Transport Monitoring",
    bgImage: transportImg,
    description:
      "Manage school buses, routes, drivers, vehicle details, and student transportation from one centralized dashboard.",
    features: [
      "Route Planning",
      "Bus Allocation",
      "Driver Management",
      "Vehicle Tracking",
      "Pickup & Drop Records",
      "Transport Reports"
    ],
    benefits: [
      "Improved student safety",
      "Better route planning",
      "Easy transport management",
      "Real-time monitoring"
    ],
    footer: "Ensure safer and smarter transportation.",
  },

  "staff-management": {
    icon: "Users",
    title: "Staff Management",
    heading: "Complete Employee Management System",
    bgImage: staffImg,
    description:
      "Manage teaching and non-teaching staff information, attendance, leave, payroll, and performance from one platform.",
    features: [
      "Staff Profiles",
      "Attendance",
      "Leave Management",
      "Payroll",
      "Performance Records",
      "Document Management"
    ],
    benefits: [
      "Centralized employee records",
      "Reduced HR workload",
      "Better workforce management",
      "Accurate payroll processing"
    ],
    footer: "Manage your staff efficiently with SchoolSpine.",
  },

  "parent-app": {
    icon: "Smartphone",
    title: "Parent App",
    heading: "Strengthen Parent-School Communication",
    bgImage: parentImg,
    description:
      "Keep parents connected with real-time updates about attendance, homework, fees, results, notices, and school events through the Parent App.",
    features: [
      "Attendance Alerts",
      "Homework Updates",
      "Exam Results",
      "Fee Notifications",
      "School Notices",
      "Event Updates"
    ],
    benefits: [
      "Better parent engagement",
      "Instant communication",
      "Improved transparency",
      "Enhanced student support"
    ],
    footer: "Stay connected anytime, anywhere.",
  },

  "store-management": {
    icon: "Store",
    title: "Store Management",
    heading: "Smart Inventory & Store Management",
    bgImage: storeImg,
    description:
      "Manage school inventory, stock, purchases, suppliers, and issue records efficiently while maintaining complete visibility over available resources.",
    features: [
      "Inventory Management",
      "Stock Tracking",
      "Purchase Records",
      "Supplier Management",
      "Issue & Return Records",
      "Stock Reports"
    ],
    benefits: [
      "Better inventory control",
      "Reduced stock shortages",
      "Organized purchasing",
      "Accurate inventory reports"
    ],
    footer: "Manage school resources with complete control.",
  },
};

export const getFeatureBySlug = (slug) => featureData[slug] || null;
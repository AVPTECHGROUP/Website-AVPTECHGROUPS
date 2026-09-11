import React from 'react'
import Navbar from '../../../Components/Navbar/Navbar'
import Footer from './Footer'
import ScrollToTop from '../../../Components/Common/ScrollToTop'
import FloatingContact from '../../../Components/CommonComp/FloatingContact'
import ChatWidget from "../../../Components/CommonComp/Chatwidget/ChatWidget.jsx";

const LandingLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      {children}
      <FloatingContact />
        <ChatWidget />
      <Footer />
    </>
  )
}

export default LandingLayout
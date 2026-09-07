import React from 'react'
import Navbar from '../../../Components/Navbar/Navbar'
import Footer from './Footer'
import ScrollToTop from '../../../Components/Common/ScrollToTop'
import FloatingContact from '../../../Components/CommonComp/FloatingContact'

const LandingLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      {children}
      <FloatingContact />
      <Footer />
    </>
  )
}

export default LandingLayout
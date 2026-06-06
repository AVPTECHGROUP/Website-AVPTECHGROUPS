import React from 'react'
import Navbar from '../../../Components/Navbar/Navbar'
import Footer from './Footer'
import ScrollToTop from '../../../Components/Common/ScrollToTop'

const LandingLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}

export default LandingLayout

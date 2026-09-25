import React from 'react'
import Footer from './Footer'
import ScrollToTop from '../../../Components/Common/ScrollToTop'

const LandingLayout = ({ children }) => {
  return (
    <>
      <ScrollToTop />
      {children}
      <Footer />
    </>
  )
}

export default LandingLayout
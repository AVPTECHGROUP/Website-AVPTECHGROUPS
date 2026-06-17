import React from 'react'
import Header from '../../../Components/Homes/Header'
import Mockups from '../../../Components/Homes/Mockups/Mockups'
import Details from '../../../Components/Homes/Details/Details'
import Review from '../../../Components/Homes/Review/Review'
import Pricing from '../../../Components/Homes/Pricing/Pricing'
import Security from '../../../Components/Homes/Security/Security_Section'
import FAQ from '../../../Components/Homes/Faq/Faq'
import TransformSchool from '../../../Components/Homes/Transform_School/Transform_School'

const Home = () => {
    return (
        <div className='scroll-smooth relative bg-theme-bg text-theme-text min-h-screen overflow-x-hidden transition-colors duration-300'>
            <Header />
            <Mockups />
            <Details />
            <Review />
            <Pricing />
            <Security/>
            <FAQ/>
            <TransformSchool/>
        </div>
    )
}

export default Home
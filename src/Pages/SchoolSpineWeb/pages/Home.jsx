import React from 'react'
import Header from '../../../Components/Homes/Header'
import Details from '../../../Components/Homes/Details/Details'
import Review from '../../../Components/Homes/Review/Review'
import Security from '../../../Components/Homes/Security/Security_Section'

import TransformSchool from '../../../Components/Homes/Transform_School/Transform_School'
import Pricing from './Courses'

const Home = () => {
    return (
        <div className='scroll-smooth relative bg-theme-bg text-theme-text min-h-screen overflow-x-hidden transition-colors duration-300'>
            <Header />
            <Details />
            <Pricing />
            <Review />
            <Security />
    
            <TransformSchool />
        </div>
    )
}

export default Home
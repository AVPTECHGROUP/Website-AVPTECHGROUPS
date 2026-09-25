import React from 'react'
import Header from '../../../Components/Homes/Header'
import Details from '../../../Components/Homes/Details/Details'
import Review from '../../../Components/Homes/Review/Review'


import Courses from './Courses'
import TransformCareer from '../../../Components/Homes/Transform_School/Transform_Career'

const Home = () => {
    return (
        <div className='scroll-smooth relative bg-theme-bg text-theme-text min-h-screen overflow-x-hidden transition-colors duration-300'>
            <Header />
            <Details />
            <Courses />
            <Review />
        
    
            <TransformCareer />
        </div>
    )
}

export default Home
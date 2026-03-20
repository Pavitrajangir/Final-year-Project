import React from 'react'
import Header from '../components/Header.jsx'
import SpecialityMenu from '../components/SpecialityMenu.jsx'
import TopDoctors from '../components/TopDoctors.jsx'
import Banner from '../components/Banner.jsx'
import SymptomCheckerSection from '../components/SymptomChecker.jsx'

const Home = () => (
  <div className='fade-up'>
    <Header/>
    <SpecialityMenu/>
    <SymptomCheckerSection/>
    <TopDoctors/>
    <Banner/>
  </div>
)
export default Home

import React from 'react';
import HeaderSection from './headerSection/HeaderSection';
import NewsSection from './newsSection/NewsSection';
import ScheduleSection from './scheduleSection/ScheduleSection';
// import StoreSection from './storeSection/StoreSection';
import IntroduceSection from './introduceSection/IntroduceSection';
import Menu from './menu/Menu';
import FooterSection from './footerSection/FooterSection';
import './home.css';
import EventSection from './eventSection/EventSection';
import EventConvertHMC from './eventSection/EventConvertHMC';

function Home() {
    return (
        <div className="home">
            {/* Phần Menu */}
            <Menu />

            {/* Phần Header */}
            <HeaderSection />

            {/* Phần News */}
            <NewsSection />

            {/* Phần Event  */}
            {/* <EventSection /> */}

            {/* Event quy đổi  */}
            {/* <EventConvertHMC /> */}

            {/* Phần Schedule
            <ScheduleSection /> */}

            {/* Phần Store */}
            {/* <StoreSection /> */}

            {/* Phần Giới thiệu */}
            <IntroduceSection />

            {/* Phần Footer */}
            <FooterSection />
        </div>
    );
}

export default Home;

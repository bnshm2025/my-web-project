import React from 'react';
import './ScheduleSection.css';

function ScheduleSection() {
    return (
        <section className="schedule-section">
            <h2 className="schedule-title">Lịch Trình Phát Triển</h2>
            <div className="timeline">
                <div className="timeline-event">
                    <div className="timeline-date">2025</div>
                    <div className="timeline-content">
                        <h3>Khởi Động Dự Án</h3>
                        <p>Hoàn thành ý tưởng, lập kế hoạch và xây dựng đội ngũ phát triển.</p>
                    </div>
                </div>
                <div className="timeline-event">
                    <div className="timeline-date">2025</div>
                    <div className="timeline-content">
                        <h3>Phát Triển Cơ Bản</h3>
                        <p>Xây dựng các chức năng chính và định hình gameplay.</p>
                    </div>
                </div>
                <div className="timeline-event">
                    <div className="timeline-date">2025</div>
                    <div className="timeline-content">
                        <h3>Kiểm Thử Alpha</h3>
                        <p>Kiểm thử nội bộ, thu thập phản hồi và điều chỉnh tính năng.</p>
                    </div>
                </div>
                <div className="timeline-event">
                    <div className="timeline-date">2025</div>
                    <div className="timeline-content">
                        <h3>Phiên Bản Beta</h3>
                        <p>Ra mắt phiên bản beta để thử nghiệm với người chơi thực.</p>
                    </div>
                </div>
                <div className="timeline-event">
                    <div className="timeline-date">2025</div>
                    <div className="timeline-content">
                        <h3>Phát Hành Chính Thức</h3>
                        <p>Game được phát hành chính thức trên các nền tảng.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default ScheduleSection;

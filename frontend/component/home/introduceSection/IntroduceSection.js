import React from 'react';
import './IntroduceSection.css';

function IntroduceSection() {
    return (
        <section className="introduce-section" id="introduce">
            <div className="introduce-section-overlay"></div>
            <div className="introduce-section-content-wrapper">
                <h2 className="introduce-section-title">Giới thiệu về Blade & Soul</h2>
                <p className="introduce-section-paragraph">
                    <span className="introduce-section-highlight">Blade & Soul</span> mở đầu với một bi kịch sâu sắc.
                    Bạn là một đệ tử của Hồng Môn, một môn phái võ thuật yên bình, nhưng tất cả đã thay đổi khi Jinsoyun
                    – một kẻ phản bội đầy quyền lực, mang sức mạnh từ Hoàng Hôn Kiếm (Twilight's Edge) – tàn sát sư phụ
                    và đồng môn của bạn. Bạn là người duy nhất sống sót, mang theo nỗi đau và lòng căm phẫn, bắt đầu
                    hành trình báo thù và truy tìm Jinsoyun.
                </p>
                <p className="introduce-section-paragraph">
                    Trên hành trình ấy, bạn sẽ khám phá ra những bí mật đen tối xoay quanh Hoàng Hôn Kiếm và những âm
                    mưu của các thế lực siêu nhiên. Mỗi vùng đất đều chứa đựng những sinh vật kỳ bí, những thử thách khó
                    khăn, và cả những đồng minh đáng tin cậy, nhưng cũng không thiếu kẻ thù gian ác. Thế giới của{' '}
                    <span className="introduce-section-highlight">Blade & Soul</span> là một bức tranh đa sắc, nơi thiện
                    và ác đan xen, buộc bạn phải đưa ra những quyết định thay đổi cuộc đời.
                </p>
                <p className="introduce-section-paragraph">
                    Lối chơi trong <span className="introduce-section-highlight">Blade & Soul</span> nổi bật với hệ
                    thống chiến đấu phong phú, các đòn combo mãn nhãn và kỹ năng độc đáo. Bạn có thể tùy chỉnh phong
                    cách chiến đấu của mình, từ các đòn đánh vật lý mạnh mẽ đến phép thuật huyền bí, mang đến những trải
                    nghiệm phong phú. Kết hợp cùng đồng đội trong các trận chiến PvE và PvP, bạn sẽ được thử sức trong
                    những trận đấu kịch tính và những nhiệm vụ đầy thử thách.
                </p>
                <p className="introduce-section-paragraph">
                    Trên con đường truy tìm Jinsoyun, <span className="introduce-section-highlight">Blade & Soul</span>{' '}
                    không chỉ là cuộc chiến trả thù cá nhân mà còn là hành trình khám phá bản thân. Bạn sẽ đối mặt với
                    những hy sinh đau đớn và những lựa chọn khó khăn, liệu bạn sẽ đứng về phía ánh sáng hay chìm vào
                    bóng tối? Hãy tự mình trải nghiệm thế giới kỳ ảo này và khám phá cốt truyện phức tạp, nơi mỗi quyết
                    định của bạn đều để lại dấu ấn.
                </p>
            </div>
        </section>
    );
}

export default IntroduceSection;

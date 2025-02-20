import React from 'react';
import './StoreSection.css';

function StoreSection() {
    return (
        <section className="store-section">
            <h2>Cửa hàng</h2>
            <div className="store">
                <div className="store-item">
                    <h3>Gói vật phẩm A</h3>
                    <p>Giá: 100.000 VNĐ</p>
                </div>
                <div className="store-item">
                    <h3>Gói vật phẩm B</h3>
                    <p>Giá: 200.000 VNĐ</p>
                </div>
            </div>
        </section>
    );
}

export default StoreSection;

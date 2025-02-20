import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import moment from 'moment';
import './SearchResultsPage.css';
import Menu from '../home/menu/Menu';
import FooterSection from '../home/footerSection/FooterSection';
import { FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';

/**
 * Hàm chuyển đổi ArrayBuffer thành Base64
 */
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const keyword = searchParams.get('keyword'); // Lấy từ khóa tìm kiếm từ URL

    /**
     * Hàm tải dữ liệu từ API
     */
    const fetchResults = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://bnshongmoon.com/api/search', {
                params: { keyword },
            });
            setResults(response.data);
            setError(null);
        } catch (err) {
            console.error('Lỗi khi tải dữ liệu tìm kiếm:', err);
            setError('Không thể tải kết quả tìm kiếm. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (keyword) {
            fetchResults();
        } else {
            setError('Vui lòng nhập từ khóa để tìm kiếm!');
        }
    }, [keyword]);

    if (loading) {
        return (
            <div className="loading-spinner">
                <ClipLoader color="#3498db" loading={loading} size={50} />
            </div>
        );
    }


    return (
        <>
            <Menu isStatic />
            <div className="search-results-container">
                <h1 className="search-results-title">Kết Quả Tìm Kiếm</h1>
                <p className="search-keyword">Từ khóa: "{keyword}"</p>
    
                {/* Hiển thị lỗi nếu có */}
                {error && <p className="error-message">{error}</p>}
    
                {/* Hiển thị thông báo không có kết quả nếu không có kết quả */}
                {!error && results.length === 0 && (
                    <p className="no-results">
                        Không tìm thấy kết quả nào cho từ khóa "{keyword}".
                    </p>
                )}
    
                {/* Hiển thị danh sách kết quả */}
                <ul className="search-results-list">
                    {results.map((result) => {
                        let base64Image = '';
                        if (result.Image && result.Image.data) {
                            const imageType = 'jpeg';
                            base64Image = `data:image/${imageType};base64,${arrayBufferToBase64(result.Image.data)}`;
                        }
    
                        return (
                            <li key={result.Slug} className="search-result-item">
                                <a href={`/news/${result.Slug}`} className="search-result-link">
                                    {base64Image && (
                                        <img
                                            src={base64Image}
                                            alt={result.Title}
                                            className="search-result-image"
                                        />
                                    )}
                                    <div className="search-result-info">
                                        <h4 className="search-result-title">
                                            {result.Title || 'Không có tiêu đề'}
                                        </h4>
                                        <p className="search-result-date">
                                            <FaCalendarAlt className="date-icon" />
                                            {moment(result.Date).format('DD/MM/YYYY')}
                                        </p>
                                        <div
                                            className="search-result-snippet"
                                            dangerouslySetInnerHTML={{
                                                __html: result.Content
                                                    ? `${result.Content.slice(0, 100)}...`
                                                    : 'Không có nội dung',
                                            }}
                                        ></div>
                                    </div>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </div>
            <FooterSection />
        </>
    );
    
}

export default SearchResultsPage;

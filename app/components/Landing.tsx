"use client";
import React from 'react';
import BounceLoader from './BounceLoader'; // Nhập hiệu ứng loader
interface LandingProps {
    loading: boolean; // Thêm prop loading
}
const Landing: React.FC<LandingProps> = ({ loading }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
                <h2 className="text-lg text-black">Khi bạn sẵn sàng là chúng ta có thể bắt đầu.</h2>
                {loading && ( // Hiển thị loader khi loading là true
                                <div className="flex justify-center my-4">
                                    <BounceLoader /> 
                                </div>
                            )}
            </div>
        </div>
    );
};

export default Landing;
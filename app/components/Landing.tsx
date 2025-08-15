import React from 'react';
import BounceLoader from './BounceLoader'; // Nhập hiệu ứng loader
interface LandingProps {
    loading: boolean; // Thêm prop loading
}
const Landing: React.FC<LandingProps> = ({ loading }) => {
    return (
        <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center">
                <h2 className="text-4xl text-black">Ready when you are.</h2>
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
import {
    FaShoppingBasket,
    FaAppleAlt,
    FaCheese,
    FaMedkit,
    FaMobileAlt,
    FaLaptop,
    FaTshirt,
    FaHome,
    FaTv,
    FaHeart,
    FaBook,
    FaWrench,
    FaCar,
    FaDumbbell,
    FaHandsHelping
} from 'react-icons/fa';

const categoriesData = [
    { name: 'Grocery & Essentials', icon: <FaShoppingBasket className="text-green-600" /> },
    { name: 'Fresh Fruits & Vegetables', icon: <FaAppleAlt className="text-red-500" /> },
    { name: 'Dairy & Bakery', icon: <FaCheese className="text-yellow-500" /> },
    { name: 'Pharmacy & Health', icon: <FaMedkit className="text-red-600" /> },
    { name: 'Mobiles & Accessories', icon: <FaMobileAlt className="text-blue-600" /> },
    { name: 'Electronics', icon: <FaLaptop className="text-indigo-600" /> },
    { name: 'Fashion', icon: <FaTshirt className="text-pink-500" /> },
    { name: 'Home & Kitchen', icon: <FaHome className="text-orange-500" /> },
    { name: 'Appliances', icon: <FaTv className="text-gray-700" /> },
    { name: 'Beauty & Personal Care', icon: <FaHeart className="text-pink-400" /> },
    { name: 'Stationery & Books', icon: <FaBook className="text-blue-400" /> },
    { name: 'Hardware & Tools', icon: <FaWrench className="text-gray-500" /> },
];

const CategoryItem = ({ name, icon, isSelected, onClick }) => {
    return (
        <div
            className={`flex flex-col items-center justify-start gap-2 cursor-pointer group w-[80px] sm:w-[90px] md:w-[100px] mt-2 transition-all duration-300 ${isSelected ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100'}`}
            onClick={onClick}
        >
            <div className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                {/* 3D Platform effect mimicking the reference image */}
                <div className={`absolute bottom-1 w-[90%] h-[55%] rounded-xl shadow-sm border-b-4 transition-all duration-300 ${isSelected ? 'bg-gradient-to-b from-cyan-300 to-cyan-500 border-cyan-600' : 'bg-gradient-to-b from-cyan-50 to-cyan-200 border-cyan-400 group-hover:border-cyan-500 group-hover:from-cyan-100 group-hover:to-cyan-300'}`}></div>

                {/* Floating Icon */}
                <div className={`relative z-10 text-3xl sm:text-4xl drop-shadow-md transition-transform duration-300 ease-out pb-2 ${isSelected ? '-translate-y-2 scale-110' : 'group-hover:-translate-y-2 group-hover:scale-110'}`}>
                    {icon}
                </div>
            </div>
            <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight transition-colors duration-300 h-8 line-clamp-2 px-1 ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}>{name}</span>
        </div>
    );
};

const Categories = ({ onCategorySelect, selectedCategory }) => {
    return (
        <div className="bg-white py-6 px-4 rounded-xl shadow-sm mb-8">
            <div className="flex flex-wrap gap-x-2 sm:gap-x-4 md:gap-x-6 gap-y-6 justify-center">
                {categoriesData.map((cat, index) => (
                    <CategoryItem
                        key={index}
                        name={cat.name}
                        icon={cat.icon}
                        isSelected={selectedCategory === cat.name}
                        onClick={() => onCategorySelect && onCategorySelect(cat.name)}
                    />
                ))}
            </div>
        </div>
    );
};

export default Categories;

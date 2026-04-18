import React, { useContext } from 'react';
import './FoodItem.css';
import { assets } from '../../assets/assets';
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ image, name, price, desc, id }) => {
    const { cartItems, addToCart, removeFromCart, currency } = useContext(StoreContext);

    // ✅ fallback image
    const fallbackImage = "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";

    // 🔥 FIX: handle both filename + full URL
    const getImageUrl = () => {
        if (!image) return fallbackImage;

        // if already full URL
        if (image.startsWith("http")) return image;

        // if only filename
        return `https://food-court-20n0.onrender.com/images/${image}`;
    };

    return (
        <div className='food-item'>
            <div className='food-item-img-container'>
                <img
                    className='food-item-image'
                    src={getImageUrl()}
                    alt={name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                    }}
                />

                {!cartItems?.[id] ? (
                    <img
                        className='add'
                        onClick={() => addToCart(id)}
                        src={assets.add_icon_white}
                        alt="Add"
                    />
                ) : (
                    <div className="food-item-counter">
                        <img
                            src={assets.remove_icon_red}
                            onClick={() => removeFromCart(id)}
                            alt="Remove"
                        />
                        <p>{cartItems?.[id]}</p>
                        <img
                            src={assets.add_icon_green}
                            onClick={() => addToCart(id)}
                            alt="Add"
                        />
                    </div>
                )}
            </div>

            <div className="food-item-info">
                <div className="food-item-name-rating">
                    <p>{name}</p>
                    <img src={assets.rating_starts} alt="Rating" />
                </div>

                <p className="food-item-desc">{desc}</p>

                <p className="food-item-price">
                    {currency}{price}
                </p>
            </div>
        </div>
    );
};

export default FoodItem;

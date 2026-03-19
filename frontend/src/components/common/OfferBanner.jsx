import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { offerAPI } from "../../services/api";
import { X, Sparkles, Tag } from "lucide-react";

const OfferBanner = () => {
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("offerBannerDismissed") === "true") { 
      setVisible(false); 
      return; 
    }
    
    offerAPI.getStoreWide()
      .then(res => { 
        const data = res.data || res; 
        if (data && data._id) {
          setOffer(data);
        }
      })
      .catch(err => console.error("OfferBanner error:", err));
  }, []);

  const dismiss = () => { 
    setVisible(false); 
    sessionStorage.setItem("offerBannerDismissed", "true"); 
  };

  if (!offer || !visible) return null;

  const discount = offer.discountType === "percentage" 
    ? `${offer.discountValue}% OFF` 
    : `Rs. ${offer.discountValue} OFF`;
  
  const scopeText = offer.scope === "entire_store" 
    ? "SITEWIDE" 
    : offer.scope === "categories" 
    ? "ON SELECTED CATEGORIES" 
    : "ON SELECTED PRODUCTS";

  const promoText = `🎉 ${offer.title.toUpperCase()} IS ACTIVE! • GET ${discount} ${scopeText} • GET AMAZING DISCOUNTS TO DOUBLE THE JOY! • SHOP NOW & SAVE BIG! 🎉`;

  return (
    <div className="relative bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 text-white overflow-hidden shadow-lg">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" 
           style={{ backgroundSize: '200% 100%', animation: 'shimmer 3s infinite' }} />
      
      <div className="overflow-hidden py-3 pr-12">
        <div className="flex whitespace-nowrap items-center" 
             style={{ animation: "marquee 30s linear infinite" }}>
          {[0, 1, 2, 3, 4].map(i => (
            <Link 
              key={i} 
              to={`/offers/${offer._id}`}
              className="inline-flex items-center gap-2 px-8 text-base font-bold hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>{promoText}</span>
              <Tag className="w-5 h-5" />
            </Link>
          ))}
        </div>
      </div>
      
      <button 
        onClick={dismiss} 
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm group" 
        aria-label="Dismiss offer banner">
        <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
      </button>
      
      <style>{`
        @keyframes marquee { 
          from { transform: translateX(0) } 
          to { transform: translateX(-50%) } 
        }
        @keyframes shimmer {
          0% { background-position: -200% 0 }
          100% { background-position: 200% 0 }
        }
      `}</style>
    </div>
  );
};

export default OfferBanner;

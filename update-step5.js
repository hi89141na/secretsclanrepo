const fs = require('fs');
const path = require('path');

console.log('🔧 Step 5/10: Creating OfferBanner component...');

// Ensure directory exists
const dir = 'frontend/src/components/common';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const offerBannerContent = String.raw`import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerAPI } from '../../services/api';
import { X } from 'lucide-react';

const OfferBanner = () => {
  const [offer, setOffer] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    fetchStoreWideOffer();
    
    const dismissed = sessionStorage.getItem('offerBannerDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const fetchStoreWideOffer = async () => {
    try {
      const response = await offerAPI.getStoreWide();
      const offerData = response.data || response;
      
      if (offerData) {
        setOffer(offerData);
      }
    } catch (error) {
      console.error('Error fetching store-wide offer:', error);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('offerBannerDismissed', 'true');
  };

  if (!offer || !isVisible || isDismissed) return null;

  const getScopeText = () => {
    if (offer.scope === 'entire_store') {
      return 'Sitewide';
    } else if (offer.scope === 'categories') {
      return 'Selected Categories';
    } else {
      return 'Selected Products';
    }
  };

  return (
    <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white overflow-hidden">
      <div className="marquee-container py-3">
        <div className="marquee-content">
          <Link 
            to={` + '`/offers/${offer._id}`' + `} 
            className="inline-flex items-center space-x-8 hover:opacity-80 transition-opacity"
          >
            <span className="text-lg font-bold">
              🎉 {offer.title}
            </span>
            <span className="text-sm">
              {getScopeText()} - Save{' '}
              {offer.discountType === 'percentage' 
                ? ` + '`${offer.discountValue}%`' + ` 
                : ` + '`Rs. ${offer.discountValue}`' + `}
            </span>
            <span className="text-sm font-semibold bg-white text-purple-600 px-3 py-1 rounded-full">
              Shop Now →
            </span>
          </Link>
          <Link 
            to={` + '`/offers/${offer._id}`' + `} 
            className="inline-flex items-center space-x-8 hover:opacity-80 transition-opacity"
          >
            <span className="text-lg font-bold">
              🎉 {offer.title}
            </span>
            <span className="text-sm">
              {getScopeText()} - Save{' '}
              {offer.discountType === 'percentage' 
                ? ` + '`${offer.discountValue}%`' + ` 
                : ` + '`Rs. ${offer.discountValue}`' + `}
            </span>
            <span className="text-sm font-semibold bg-white text-purple-600 px-3 py-1 rounded-full">
              Shop Now →
            </span>
          </Link>
        </div>
      </div>
      
      <button
        onClick={handleDismiss}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={20} />
      </button>

      <style jsx>{\` + '`' + `
        .marquee-container {
          overflow: hidden;
        }
        
        .marquee-content {
          display: flex;
          animation: marquee 30s linear infinite;
          white-space: nowrap;
        }
        
        .marquee-content > * {
          padding-right: 4rem;
        }
        
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .marquee-content:hover {
          animation-play-state: paused;
        }
      ` + '`' + `}</style>
    </div>
  );
};

export default OfferBanner;
`;

fs.writeFileSync('frontend/src/components/common/OfferBanner.jsx', offerBannerContent, 'utf8');
console.log('✅ Step 5/10: Created frontend/src/components/common/OfferBanner.jsx\n');

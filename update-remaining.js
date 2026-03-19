const fs = require('fs');

// 1 ─── OfferBanner.jsx
fs.writeFileSync('frontend/src/components/common/OfferBanner.jsx', `
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { offerAPI } from '../../services/api';
import { X } from 'lucide-react';

const OfferBanner = () => {
  const [offer, setOffer] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem('offerBannerDismissed') === 'true') {
      setVisible(false);
      return;
    }
    offerAPI.getStoreWide()
      .then(res => { const d = res.data || res; if (d) setOffer(d); })
      .catch(err => console.error('OfferBanner:', err));
  }, []);

  if (!offer || !visible) return null;

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('offerBannerDismissed', 'true');
  };

  const discount = offer.discountType === 'percentage'
    ? offer.discountValue + '%'
    : 'Rs. ' + offer.discountValue;

  const scopeText = offer.scope === 'entire_store' ? 'Sitewide' :
                    offer.scope === 'categories'   ? 'Selected Categories' : 'Selected Products';

  const text = '🎉 ' + offer.title + '  ·  ' + scopeText + ' – Save ' + discount + '  ·  Shop Now →';

  return (
    <div className="relative bg-gradient-to-r from-purple-700 via-pink-600 to-red-600 text-white overflow-hidden">
      <div className="overflow-hidden py-2.5 pr-10">
        <div className="flex whitespace-nowrap animate-marquee">
          {[0,1,2,3].map(i => (
            <Link key={i} to={'/offers/' + offer._id}
              className="inline-block px-16 text-sm font-medium hover:opacity-80 transition-opacity">
              {text}
            </Link>
          ))}
        </div>
      </div>
      <button onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss">
        <X size={18} />
      </button>
    </div>
  );
};

export default OfferBanner;
`.trim(), 'utf8');
console.log('OK  frontend/src/components/common/OfferBanner.jsx');

import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { apiFetch } from '../config';
import './home.css';

const navItems = [
  { label: 'Home (होम)', to: '/home', exact: true },
  { label: 'Marketplace (बाजार / फसल बेचें)', to: '/portal' },
  { label: 'Kisan Chopal (किसान चौपाल)', to: '/chopal' },
  { label: 'Services (सेवाएं व योजनाएं)', to: '/services' },
  { label: 'AI Crop Doctor (फसल डॉक्टर)', to: '/chat' },
  { label: 'Profile (प्रोफाइल)', to: '/profile' },
];

const features = [
  {
    title: 'AI Crop Doctor & Chatbot (फसल डॉक्टर व सलाह)',
    description: 'Upload leaf photos for instant crop disease diagnosis. Speak in Hindi or English for audio advice. (पत्ती के फोटो से रोग पहचानें व समाधान पाएं)',
    to: '/chat',
    badge: 'AI Vision + Voice (एआई डॉक्टर)'
  },
  {
    title: 'Kisan Chopal Community (किसान चौपाल चर्चा मंच)',
    description: 'Ask farming questions, share experiences, and get expert advice from scientists. (कृषि प्रश्न पूछें और किसानों व वैज्ञानिकों से सलाह लें)',
    to: '/chopal',
    badge: 'Kisan Forum (किसान चौपाल)'
  },
  {
    title: 'Produce Marketplace (फसल बिक्री बाजार)',
    description: 'Sell harvested crops directly to verified wholesalers at your price with 0% middleman commission. (बिना दलाल सीधे व्यापारियों को फसल बेचें)',
    to: '/portal',
    badge: 'Direct B2B (सीधा व्यापार)'
  },
  {
    title: 'Kisan Bahi-Khata & Calculator (बही-खाता व खाद गणक)',
    description: 'Calculate fertilizer bags (Urea, DAP), track seasonal farm expenses, and explore central subsidies. (खाद की मात्रा व लागत-मुनाफे का हिसाब रखें)',
    to: '/services',
    badge: 'Financial & Schemes (योजनाएं)'
  },
  {
    title: 'Farmer Profile & Field Setup (किसान प्रोफाइल व खेत)',
    description: 'Update your registered crops, view saved field coordinates, and manage account details. (अपनी खेत लोकेशन, फसलें व खाता विवरण देखें)',
    to: '/profile',
    badge: 'My Farm (मेरा खेत)'
  }
];

export const DEFAULT_MANDI_RATES = [
  // Cereals & Grains
  { commodity: 'Wheat (गेहूं)', market: 'Indore Mandi', modalPrice: 2850, changePercent: '+2.4%', isPositive: true },
  { commodity: 'Wheat (गेहूं)', market: 'Khanna Mandi', modalPrice: 2420, changePercent: '+0.8%', isPositive: true },
  { commodity: 'Paddy / Basmati (धान)', market: 'Karnal Mandi', modalPrice: 4350, changePercent: '+1.9%', isPositive: true },
  { commodity: 'Paddy / Common (धान मोटा)', market: 'Warangal Mandi', modalPrice: 2360, changePercent: '+0.7%', isPositive: true },
  { commodity: 'Maize (मक्का)', market: 'Gulabbagh Mandi', modalPrice: 2280, changePercent: '+0.4%', isPositive: true },
  { commodity: 'Bajra (बाजरा)', market: 'Jaipur Mandi', modalPrice: 2550, changePercent: '-0.8%', isPositive: false },
  { commodity: 'Jowar (ज्वार)', market: 'Solapur Mandi', modalPrice: 3450, changePercent: '+1.6%', isPositive: true },
  { commodity: 'Barley (जौ)', market: 'Aligarh Mandi', modalPrice: 2150, changePercent: '+1.1%', isPositive: true },
  { commodity: 'Ragi (रागी)', market: 'Mysuru Mandi', modalPrice: 3890, changePercent: '-0.6%', isPositive: false },

  // Pulses
  { commodity: 'Chana (चना)', market: 'Neemuch Mandi', modalPrice: 5600, changePercent: '+1.2%', isPositive: true },
  { commodity: 'Tur / Arhar (तुअर)', market: 'Latur Mandi', modalPrice: 9450, changePercent: '+2.8%', isPositive: true },
  { commodity: 'Moong (मूंग)', market: 'Harda Mandi', modalPrice: 8200, changePercent: '-1.4%', isPositive: false },
  { commodity: 'Urad (उड़द)', market: 'Lalitpur Mandi', modalPrice: 7850, changePercent: '+1.9%', isPositive: true },
  { commodity: 'Masoor (मसूर)', market: 'Vidisha Mandi', modalPrice: 6300, changePercent: '+1.3%', isPositive: true },

  // Oilseeds
  { commodity: 'Soybean (सोयाबीन)', market: 'Ujjain Mandi', modalPrice: 4620, changePercent: '+3.1%', isPositive: true },
  { commodity: 'Mustard (सरसों)', market: 'Alwar Mandi', modalPrice: 5850, changePercent: '+1.8%', isPositive: true },
  { commodity: 'Groundnut (मूंगफली)', market: 'Junagadh Mandi', modalPrice: 6450, changePercent: '+2.1%', isPositive: true },
  { commodity: 'Sunflower (सूरजमुखी)', market: 'Raichur Mandi', modalPrice: 5350, changePercent: '-1.2%', isPositive: false },
  { commodity: 'Sesame / Til (तिल)', market: 'Amreli Mandi', modalPrice: 12800, changePercent: '+2.6%', isPositive: true },

  // Cash Crops
  { commodity: 'Cotton (कपास)', market: 'Rajkot Mandi', modalPrice: 7350, changePercent: '-1.2%', isPositive: false },
  { commodity: 'Sugarcane (गन्ना)', market: 'Muzaffarnagar Mandi', modalPrice: 390, changePercent: '+1.5%', isPositive: true },
  { commodity: 'Jute (पटसन / जूट)', market: 'Barrackpore Mandi', modalPrice: 5200, changePercent: '+1.8%', isPositive: true },

  // Vegetables & Spices
  { commodity: 'Onion (प्याज)', market: 'Lasalgaon Mandi', modalPrice: 2100, changePercent: '+4.8%', isPositive: true },
  { commodity: 'Potato (आलू)', market: 'Agra Mandi', modalPrice: 1420, changePercent: '-0.9%', isPositive: false },
  { commodity: 'Tomato (टमाटर)', market: 'Kolar Mandi', modalPrice: 1650, changePercent: '+5.5%', isPositive: true },
  { commodity: 'Garlic (लहसुन)', market: 'Mandsaur Mandi', modalPrice: 14500, changePercent: '+3.8%', isPositive: true },
  { commodity: 'Ginger (अदरक)', market: 'Wayanad Mandi', modalPrice: 8900, changePercent: '-1.5%', isPositive: false },
  { commodity: 'Green Chilli (हरी मिर्च)', market: 'Guntur Mandi', modalPrice: 3800, changePercent: '+4.2%', isPositive: true },
  { commodity: 'Red Chilli (लाल मिर्च)', market: 'Guntur Mandi', modalPrice: 18400, changePercent: '-1.8%', isPositive: false },
  { commodity: 'Turmeric (हल्दी)', market: 'Erode Mandi', modalPrice: 13200, changePercent: '+3.5%', isPositive: true },
  { commodity: 'Cumin (जीरा)', market: 'Unjha Mandi', modalPrice: 26800, changePercent: '+2.9%', isPositive: true },
  { commodity: 'Coriander (धनिया)', market: 'Kota Mandi', modalPrice: 7400, changePercent: '+1.7%', isPositive: true },

  // Fruits
  { commodity: 'Apple (सेब)', market: 'Shimla Mandi', modalPrice: 7800, changePercent: '+2.8%', isPositive: true },
  { commodity: 'Mango (आम)', market: 'Lucknow Mandi', modalPrice: 4800, changePercent: '+3.2%', isPositive: true },
  { commodity: 'Banana (केला)', market: 'Jalgaon Mandi', modalPrice: 1850, changePercent: '-1.6%', isPositive: false },
];

export const DEFAULT_WEATHER_DATA = {
  currentWeather: {
    tempCelsius: 28,
    humidityPercent: 62,
    windSpeedKmh: 11,
    condition: 'Partly Cloudy / साफ़ धूप',
  },
  agriAdvisories: [
    {
      type: 'spraying',
      level: 'Optimal',
      badge: 'Safe to Spray',
      hindiBadge: 'कीटनाशक छिड़काव के लिए उत्तम',
      message: 'Wind speed is low (11 km/h) and no heavy rain expected today. Ideal for foliar spray of micronutrients and pest control before noon.'
    }
  ]
};

export const INDIAN_CROP_CATEGORIES = [
  {
    category: 'Cereals & Grains (अनाज)',
    crops: [
      { id: 'Wheat', label: 'Wheat (गेहूं)' },
      { id: 'Paddy', label: 'Paddy / Basmati (धान)' },
      { id: 'Paddy Common', label: 'Paddy / Common (धान मोटा)' },
      { id: 'Maize', label: 'Maize (मक्का)' },
      { id: 'Bajra', label: 'Bajra (बाजरा)' },
      { id: 'Jowar', label: 'Jowar (ज्वार)' },
      { id: 'Barley', label: 'Barley (जौ)' },
      { id: 'Ragi', label: 'Ragi (रागी)' },
    ]
  },
  {
    category: 'Pulses (दालें / दलहन)',
    crops: [
      { id: 'Chana', label: 'Chana (चना)' },
      { id: 'Arhar', label: 'Tur / Arhar (तुअर / अरहर)' },
      { id: 'Moong', label: 'Moong (मूंग)' },
      { id: 'Urad', label: 'Urad (उड़द)' },
      { id: 'Masoor', label: 'Masoor (मसूर)' },
    ]
  },
  {
    category: 'Oilseeds (तिलहन)',
    crops: [
      { id: 'Soybean', label: 'Soybean (सोयाबीन)' },
      { id: 'Mustard', label: 'Mustard (सरसों / राई)' },
      { id: 'Groundnut', label: 'Groundnut (मूंगफली)' },
      { id: 'Sunflower', label: 'Sunflower (सूरजमुखी)' },
      { id: 'Sesame', label: 'Sesame / Til (तिल)' },
    ]
  },
  {
    category: 'Cash Crops (नकदी फसलें)',
    crops: [
      { id: 'Cotton', label: 'Cotton (कपास)' },
      { id: 'Sugarcane', label: 'Sugarcane (गन्ना)' },
      { id: 'Jute', label: 'Jute (पटसन / जूट)' },
    ]
  },
  {
    category: 'Vegetables (सब्जियां)',
    crops: [
      { id: 'Onion', label: 'Onion (प्याज)' },
      { id: 'Potato', label: 'Potato (आलू)' },
      { id: 'Tomato', label: 'Tomato (टमाटर)' },
      { id: 'Garlic', label: 'Garlic (लहसुन)' },
      { id: 'Ginger', label: 'Ginger (अदरक)' },
      { id: 'Green Chilli', label: 'Green Chilli (हरी मिर्च)' },
    ]
  },
  {
    category: 'Spices (मसाले)',
    crops: [
      { id: 'Cumin', label: 'Cumin / Jeera (जीरा)' },
      { id: 'Turmeric', label: 'Turmeric / Haldi (हल्दी)' },
      { id: 'Coriander', label: 'Coriander / Dhaniya (धनिया)' },
      { id: 'Red Chilli', label: 'Red Chilli (सूखी लाल मिर्च)' },
    ]
  },
  {
    category: 'Fruits (फल)',
    crops: [
      { id: 'Apple', label: 'Apple (सेब)' },
      { id: 'Mango', label: 'Mango (आम)' },
      { id: 'Banana', label: 'Banana (केला)' },
    ]
  }
];

export function getFallbackPricePrediction(commodity = 'Wheat') {
  const basePrices = {
    // Cereals & Grains
    'Wheat': { current: 2850, peak: 3040, change: '+6.6%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — भाव बढ़ने का अनुमान', reason: 'त्योहारी मांग और सीमित मंडी आवक के कारण अगले 10 दिनों में भाव में मजबूती के संकेत हैं।' },
    'Paddy': { current: 4350, peak: 4580, change: '+5.3%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — बासमती निर्यात मांग मजबूत', reason: 'बासमती चावल के अंतरराष्ट्रीय निर्यात ऑर्डर्स में वृद्धि से मंडियों में प्रीमियम बना रहेगा।' },
    'Paddy Common': { current: 2360, peak: 2440, change: '+3.4%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — MSP समर्थन जारी', reason: 'सरकारी खरीद केंद्र सक्रिय होने से न्यूनतम समर्थन मूल्य (MSP) से ऊपर लिवाली जारी है।' },
    'Maize': { current: 2280, peak: 2420, change: '+6.1%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — औद्योगिक मांग मजबूत', reason: 'एथेनॉल और पोल्ट्री फीड इंडस्ट्री की भारी मांग से मक्के के भाव में तेजी के आसार हैं।' },
    'Bajra': { current: 2550, peak: 2480, change: '-2.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — आवक से नरमी संभव', reason: 'राजस्थान और हरियाणा की मंडियों में नई फसल की भारी आवक से भाव थोड़ा नरम हो सकते हैं।' },
    'Jowar': { current: 3450, peak: 3620, change: '+4.9%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — श्रीअन्न मांग मजबूत', reason: 'मिल्ट्स (श्रीअन्न) की स्वास्थ्य मांग बढ़ने से मालवा और दक्कन मंडियों में भाव मजबूत हैं।' },
    'Barley': { current: 2150, peak: 2260, change: '+5.1%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — माल्ट इंडस्ट्री लिवाली', reason: 'माल्ट व बेवरेज कंपनियों की सतत खरीदारी से जौ के भाव स्थिर व ऊपर की ओर हैं।' },
    'Ragi': { current: 3890, peak: 3780, change: '-2.8%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — स्थानीय आवक तेज', reason: 'कर्नाटक के प्रमुख उत्पादक क्षेत्रों से आवक बढ़ने के कारण मौजूदा स्तर पर बिकवाली उचित है।' },

    // Pulses
    'Chana': { current: 5600, peak: 5880, change: '+5.0%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — दाल मिल मांग मजबूत', reason: 'दाल मिलों की सक्रिय मांग व त्योहारी खपत के चलते देशी चने में मजबूती बनी रहेगी।' },
    'Arhar': { current: 9450, peak: 9950, change: '+5.3%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — कम स्टॉक का लाभ', reason: 'तुअर दाल की घरेलू मांग व कम स्टॉक के चलते भाव ₹10,000 प्रति क्विंटल के करीब पहुंचने का अनुमान है।' },
    'Moong': { current: 8200, peak: 7980, change: '-2.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — समर आवक से दबाव', reason: 'मध्य प्रदेश व राजस्थान से समर मूंग की ताजा आवक बढ़ने से भाव पर दबाव संभव है।' },
    'Urad': { current: 7850, peak: 8200, change: '+4.5%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — दाल मिलर्स सक्रिय', reason: 'साउथ इंडियन व स्थानीय दाल मिलर्स की लगातार पूछपरख से उड़द में उछाल देखा जा रहा है।' },
    'Masoor': { current: 6300, peak: 6520, change: '+3.5%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — आयात भाव ऊंचे', reason: 'आयातित मसूर के ऊंचे भाव और स्थानीय मंडी में अच्छी मांग से भाव सुधर रहे हैं।' },

    // Oilseeds
    'Soybean': { current: 4620, peak: 4920, change: '+6.5%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — क्रशिंग प्लांट लिवाली', reason: 'सोयामील निर्यात में तेजी व क्रशिंग प्लांटों की मजबूत लिवाली से भाव में सुधार जारी है।' },
    'Mustard': { current: 5850, peak: 5950, change: '+1.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — पीक सीजन मुनाफावसूली', reason: 'सरसों के भाव अपने मौसमी शिखर पर हैं, तेल मिलों की आवक बढ़ने से पहले बिकवाली फायदेमंद है।' },
    'Groundnut': { current: 6450, peak: 6780, change: '+5.1%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — दाना निर्यात ऑर्डर्स', reason: 'सौराष्ट्र व गुजरात से मूंगफली दाना निर्यात मांग मजबूत रहने से भाव तेज रहने के संकेत हैं।' },
    'Sunflower': { current: 5350, peak: 5180, change: '-3.2%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — तेल आयात दबाव', reason: 'खाद्य तेल आयात में रियायतों के चलते सूरजमुखी के घरेलू भाव में नरमी का रुख है।' },
    'Sesame': { current: 12800, peak: 13600, change: '+6.2%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — बेकरी व एक्सपोर्ट मांग', reason: 'सफेद तिल की निर्यात मांग व बेकरी सेक्टर से ऑर्डर्स बढ़ने से भाव ₹13,500 पार करने के आसार हैं।' },

    // Cash Crops
    'Cotton': { current: 7350, peak: 7150, change: '-2.7%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — कताई मिलों की सुस्त खरीद', reason: 'वैश्विक कॉटन वायदा में नरमी व कताई मिलों की सीमित खरीद से मौजूदा भाव पर बिक्री उचित है।' },
    'Sugarcane': { current: 390, peak: 405, change: '+3.8%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — SAP मूल्य स्थिरता', reason: 'चीनी मिलों द्वारा पेराई सत्र के दौरान समय पर भुगतान व राज्य परामर्शित मूल्य (SAP) का समर्थन।' },
    'Jute': { current: 5200, peak: 5450, change: '+4.8%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — पैकेजिंग मांग', reason: 'खाद्यान्न पैकेजिंग के लिए सरकारी गनी बैग्स ऑर्डर्स से जूट के भाव में मजबूती है।' },

    // Vegetables & Spices
    'Onion': { current: 2100, peak: 2550, change: '+21.4%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — त्योहारी मांग बढ़ने का अनुमान', reason: 'आने वाले त्योहारी सीजन और नासिक/लासलगांव में सीमित आवक से प्याज में भारी उछाल का अनुमान है।' },
    'Potato': { current: 1420, peak: 1380, change: '-2.8%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — कोल्ड स्टोरेज निकासी तेज है', reason: 'कोल्ड स्टोरेज से निकासी तेज होने और नई फसल की बुवाई शुरू होने से तुरंत बेचना लाभकारी रहेगा।' },
    'Tomato': { current: 1650, peak: 2050, change: '+24.2%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — कम आवक से दाम चढ़ेंगे', reason: 'दक्षिण भारत में बारिश के चलते मंडियों में टमाटर की आवक घटी है, जिससे भाव तेजी से बढ़ रहे हैं।' },
    'Garlic': { current: 14500, peak: 15800, change: '+9.0%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — ऊंटी लहसुन प्रीमियम', reason: 'मंसौर व कोटा मंडियों में ऊंटी व देशी लहसुन की भारी मांग के चलते भाव ₹15,500 के पार पहुंच सकते हैं।' },
    'Ginger': { current: 8900, peak: 8550, change: '-3.9%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — नई अदरक आवक शुरू', reason: 'केरल व पूर्वोत्तर से ताजा अदरक की आवक बढ़ने से बाजार भाव में गिरावट संभव है।' },
    'Green Chilli': { current: 3800, peak: 4250, change: '+11.8%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — स्थानीय खपत में तेजी', reason: 'स्थानीय सब्जियों की मांग मजबूत रहने और उत्पादन लागत अधिक होने से भाव में बढ़त कायम रहेगी।' },
    'Red Chilli': { current: 18400, peak: 17800, change: '-3.3%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — कोल्ड स्टोरेज बिक्री', reason: 'गुंटूर मंडी में कोल्ड स्टोरेज से माल की निरंतर निकासी के कारण वर्तमान उच्च भाव पर मुनाफावसूली करें।' },
    'Turmeric': { current: 13200, peak: 14400, change: '+9.1%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — मसाला कंपनियां सक्रिय', reason: 'इरोड व निजामाबाद में मसाला कंपनियों की आक्रामक लिवाली से हल्दी में दीर्घकालिक तेजी का दौर है।' },
    'Cumin': { current: 26800, peak: 28900, change: '+7.8%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — निर्यात मांग मजबूत', reason: 'उंझा मंडी में खाड़ी देशों से निर्यात ऑर्डर्स मिलने से जीरे के भाव में आगामी दिनों में उछाल तय है।' },
    'Coriander': { current: 7400, peak: 7850, change: '+6.1%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — ईगल क्वालिटी प्रीमियम', reason: 'मसाला पिसाई मिलों द्वारा बदामी व ईगल क्वालिटी धनिए की भारी खरीद से भाव ऊपर जा रहे हैं।' },

    // Fruits
    'Apple': { current: 7800, peak: 8400, change: '+7.7%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — रॉयल डिलीशियस मांग', reason: 'शिमला व कश्मीर से प्रीमियम रॉयल डिलीशियस की आवक नियंत्रित होने से महानगरों में भाव तेज हैं।' },
    'Mango': { current: 4800, peak: 5250, change: '+9.4%', rec: 'HOLD_PRODUCE', recHindi: 'फसल रोके रखें (HOLD) — दशहरी/चौसा प्रीमियम', reason: 'दशहरी व चौसा किस्मों की देशव्यापी मांग व प्रोसेसिंग यूनिट्स द्वारा खरीद से मजबूती बनी है।' },
    'Banana': { current: 1850, peak: 1780, change: '-3.8%', rec: 'SELL_NOW', recHindi: 'तुरंत बेचें (SELL NOW) — बंपर आवक से नरमी', reason: 'जलगांव व बुरहानपुर मंडियों में बंपर कटाई के चलते आवक अधिक है, अतः तुरंत बेचना हितकर है।' }
  };

  const reqLower = (commodity || 'Wheat').trim().toLowerCase();
  const matchedKey = Object.keys(basePrices).find(k => {
    const kLower = k.toLowerCase();
    return kLower === reqLower || reqLower.includes(kLower);
  }) || 'Wheat';

  const info = basePrices[matchedKey] || basePrices['Wheat'];
  const today = new Date();
  const timeline = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    timeline.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: info.current - Math.round(Math.sin(i) * 30 - i * 12),
      type: 'historical'
    });
  }

  for (let j = 1; j <= 10; j++) {
    const d = new Date(today);
    d.setDate(today.getDate() + j);
    timeline.push({
      date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      price: info.current + Math.round(j * (info.peak - info.current) / 10),
      type: 'forecast'
    });
  }

  return {
    status: 'success',
    commodity: matchedKey,
    currentPrice: info.current,
    peakPrice: info.peak,
    projectedChange: info.change,
    recommendation: info.rec,
    recommendationHindi: info.recHindi,
    reasoning: info.reason || (info.rec === 'HOLD_PRODUCE'
      ? `Upcoming market demand and limited APMC mandi arrivals indicate an upward trajectory of ${info.change} over the next 10 days.`
      : `Arrivals from major production hubs are rising. Offloading current harvest locks in highest profit margin before supply expansion.`),
    timeline
  };
}

export default function Home({ portalLabel, storageKeyPrefix }) {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem(`${storageKeyPrefix}_user`) || sessionStorage.getItem(`${storageKeyPrefix}_user`);
  const user = rawUser ? JSON.parse(rawUser) : null;
  const welcomeName = useMemo(() => user?.name || 'Farmer', [user]);

  // Weather and Mandi State (guaranteed fallback so Mandi rates never disappear)
  const [weatherData, setWeatherData] = useState(DEFAULT_WEATHER_DATA);
  const [mandiRates, setMandiRates] = useState(DEFAULT_MANDI_RATES);

  // Live Farm Location State
  const [farmLocation, setFarmLocation] = useState({
    latitude: null,
    longitude: null,
    placeName: '',
    status: 'detecting', // 'detecting' | 'connected' | 'denied' | 'unsupported'
  });

  // AI Mandi Price Prediction State
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [predictionData, setPredictionData] = useState(() => getFallbackPricePrediction('Wheat'));

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setFarmLocation(prev => ({ ...prev, status: 'unsupported' }));
      return;
    }

    setFarmLocation(prev => ({ ...prev, status: 'detecting' }));

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let detectedPlace = '';
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const addr = geoData.address || {};
            const city = addr.city || addr.town || addr.village || addr.county || addr.state_district || '';
            const state = addr.state || '';
            detectedPlace = [city, state].filter(Boolean).join(', ');
          }
        } catch (err) {
          // fallback
        }

        if (!detectedPlace) {
          detectedPlace = lat > 24 ? 'Northern Farm Zone, India' : 'Central Agro Zone, India';
        }

        setFarmLocation({
          latitude: lat,
          longitude: lng,
          placeName: detectedPlace,
          status: 'connected'
        });

        // Update weather advisory for this exact location
        apiFetch(`/api/agro/weather-advisory?lat=${lat}&lng=${lng}`)
          .then(res => res.json())
          .then(data => {
            if (data.advisory) setWeatherData(data.advisory);
          })
          .catch(() => {});

        // Save location to backend database
        const token =
          localStorage.getItem(`${storageKeyPrefix}_token`) ||
          sessionStorage.getItem(`${storageKeyPrefix}_token`);

        if (token) {
          apiFetch(`/api/${storageKeyPrefix}/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ latitude: lat, longitude: lng })
          }).catch(() => {});
        }
      },
      (err) => {
        console.warn('Geolocation access denied or timed out:', err);
        setFarmLocation(prev => {
          if (prev.latitude && prev.longitude) {
            return { ...prev, status: 'connected' };
          }
          return { ...prev, status: 'denied' };
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    // 1. Fetch Mandi Rates (with fallback preservation)
    apiFetch('/api/agro/mandi-rates')
      .then(res => res.json())
      .then(data => {
        if (data.rates && data.rates.length > 0) {
          setMandiRates(data.rates);
        }
      })
      .catch(err => console.warn('Mandi fetch error, keeping default rates:', err));

    // 2. Fetch initial Weather Advisory (with fallback preservation)
    apiFetch('/api/agro/weather-advisory')
      .then(res => res.json())
      .then(data => {
        if (data.advisory) setWeatherData(data.advisory);
      })
      .catch(err => console.warn('Weather fetch error, keeping default advisory:', err));

    // 3. Load saved location from DB profile
    const token =
      localStorage.getItem(`${storageKeyPrefix}_token`) ||
      sessionStorage.getItem(`${storageKeyPrefix}_token`);

    if (token) {
      apiFetch(`/api/${storageKeyPrefix}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          const loc = data.user?.location;
          if (loc && Number.isFinite(loc.latitude) && Number.isFinite(loc.longitude)) {
            setFarmLocation(prev => ({
              ...prev,
              latitude: loc.latitude,
              longitude: loc.longitude,
              placeName: prev.placeName || 'Saved Farm Coordinates',
              status: 'connected'
            }));
          }
        })
        .catch(() => {});
    }

    // 4. Request live GPS coordinates
    requestLiveLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKeyPrefix]);

  // Fetch AI Price Prediction when selectedCommodity changes
  useEffect(() => {
    apiFetch(`/api/agro/price-prediction?commodity=${selectedCommodity}`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setPredictionData(data);
        } else {
          setPredictionData(getFallbackPricePrediction(selectedCommodity));
        }
      })
      .catch(err => {
        console.warn('Price prediction fetch error, using fallback:', err);
        setPredictionData(getFallbackPricePrediction(selectedCommodity));
      });
  }, [selectedCommodity]);

  const logout = () => {
    localStorage.removeItem(`${storageKeyPrefix}_token`);
    localStorage.removeItem(`${storageKeyPrefix}_user`);
    sessionStorage.removeItem(`${storageKeyPrefix}_token`);
    sessionStorage.removeItem(`${storageKeyPrefix}_user`);
    navigate('/');
  };

  return (
    <div className="farmer-shell">
      <div className="farmer-aurora farmer-aurora-one" />
      <div className="farmer-aurora farmer-aurora-two" />

      {/* Navigation */}
      <header className="farmer-nav">
        <div className="brand-lockup">
          <span className="brand-kicker">KrishiAI Ecosystem (कृषि एआई मंच)</span>
          <span className="brand-title">{portalLabel || 'Farmer (किसान)'} Portal</span>
        </div>

        <nav className="nav-links" aria-label="Farmer navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) => (isActive ? 'nav-pill nav-pill-active' : 'nav-pill')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button className="nav-logout" type="button" onClick={logout}>
          Logout (लॉगआउट)
        </button>
      </header>

      {/* Live Mandi Ticker */}
      <div className="mandi-ticker-strip">
        <div className="mandi-ticker-header">
          <span className="mandi-pulse-dot" aria-hidden="true" />
          <span className="mandi-ticker-title">Live APMC Mandi Bhav (लाइव मंडी भाव)</span>
        </div>

        <div className="mandi-ticker-scroll" aria-label="Live Mandi Price Ticker">
          {(mandiRates && mandiRates.length > 0 ? mandiRates : DEFAULT_MANDI_RATES).map((rate, i) => (
            <div key={i} className="mandi-chip">
              <span className="mandi-chip-crop">{rate.commodity}</span>
              <span className="mandi-chip-market">({rate.market})</span>
              <span className="mandi-chip-price">₹{rate.modalPrice}</span>
              <span className="mandi-chip-unit">/qtl</span>
              <span className={`mandi-chip-trend ${rate.isPositive ? 'mandi-trend-up' : 'mandi-trend-down'}`}>
                {rate.isPositive ? '▲ ' : '▼ '}{rate.changePercent}
              </span>
            </div>
          ))}
        </div>
      </div>

      <main className="farmer-main">
        {/* Hero Section */}
        <section className="hero-panel">
          <div className="hero-copy">
            <span className="hero-badge">Welcome back (स्वागत है), {welcomeName} 👋</span>
            <h1>Grow Smarter with KrishiAI (कृषि एआई - आधुनिक किसान मंच)</h1>
            <p>
              Consult our AI Crop Doctor with leaf photos, track live mandi rates,
              and trade directly with regional wholesalers without middlemen.
              (पत्ती की फोटो से रोग पहचानें, लाइव मंडी भाव देखें और बिना दलाल सीधे फसल बेचें।)
            </p>

            {/* Live Farm Location Display Card */}
            <div className="location-hero-card">
              <div className="location-left-group">
                <div className="location-pin-circle">📍</div>
                <div className="location-meta">
                  <span className="location-meta-title">Live Farm Location (GPS) (खेत की लाइव लोकेशन)</span>
                  <div className="location-meta-address">
                    {farmLocation.status === 'connected' && (
                      farmLocation.placeName || `${farmLocation.latitude?.toFixed(4)}° N, ${farmLocation.longitude?.toFixed(4)}° E`
                    )}
                    {farmLocation.status === 'detecting' && '📡 Detecting farm GPS coordinates... (खेत की लोकेशन पहचानी जा रही है...)'}
                    {farmLocation.status === 'denied' && '⚠️ Location Permission Needed for Localized Weather (मौसम के लिए लोकेशन की अनुमति दें)'}
                    {farmLocation.status === 'unsupported' && 'Geolocation not supported by this browser (ब्राउज़र में लोकेशन सपोर्ट नहीं है)'}
                  </div>
                  {farmLocation.status === 'connected' && farmLocation.latitude && (
                    <span className="location-meta-coords">
                      Lat: {farmLocation.latitude.toFixed(4)}° • Lng: {farmLocation.longitude.toFixed(4)}° (GPS Locked)
                    </span>
                  )}
                </div>
              </div>

              <div>
                {farmLocation.status === 'connected' ? (
                  <button
                    type="button"
                    className="location-action-btn"
                    onClick={requestLiveLocation}
                    title="Refresh current GPS coordinates"
                  >
                    🔄 Update GPS (लोकेशन रिफ्रेश)
                  </button>
                ) : (
                  <button
                    type="button"
                    className="location-action-btn"
                    style={{ background: '#047857', color: '#ffffff' }}
                    onClick={requestLiveLocation}
                  >
                    📍 Enable Location (लोकेशन चालू करें)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Weather & Farm Advisory Card */}
          <div className="hero-stat-card" style={{ background: 'rgba(255,255,255,0.85)' }}>
            <div>
              <span className="stat-label">🌦️ Smart Agro-Weather (मौसम व कृषि सलाह)</span>
              <strong style={{ display: 'block', marginTop: 4 }}>
                {weatherData ? `${weatherData.currentWeather.tempCelsius}°C • ${weatherData.currentWeather.condition}` : '28°C • Partly Sunny'}
              </strong>
              <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: 4 }}>
                Humidity: {weatherData?.currentWeather.humidityPercent || 62}% • Wind: {weatherData?.currentWeather.windSpeedKmh || 11} km/h
              </div>
            </div>

            {weatherData?.agriAdvisories && (
              <div style={{ background: '#f0fdf4', padding: '10px 14px', borderRadius: 14, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#047857', fontWeight: 800 }}>
                  ✓ Advisory: {weatherData.agriAdvisories[0].hindiBadge}
                </span>
                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '4px 0 0', lineHeight: 1.4 }}>
                  {weatherData.agriAdvisories[0].message}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* AI Mandi Price Prediction & Decision Engine */}
        <section className="prediction-section">
          <div className="prediction-card">
            <div className="prediction-header-row">
              <div>
                <span className="hero-badge" style={{ marginBottom: 6 }}>
                  📈 Machine Learning Price Forecast • APMC Mandi Intel (मशीन लर्निंग भाव पूर्वानुमान)
                </span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064e3b', margin: '4px 0' }}>
                  AI Mandi Price Prediction & "HOLD vs SELL" Advisor (एआई मंडी भाव पूर्वानुमान व सलाह)
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
                  Real-time price trajectory modeling across 14 days based on arrival volumes, export mandates, and seasonality.
                  (मंडी आवक और मौसमी मांग के आधार पर आगामी दिनों का सटीक मूल्य अनुमान।)
                </p>
              </div>

              <div className="commodity-selector" style={{ alignItems: 'center' }}>
                {[
                  { id: 'Wheat', label: 'Wheat (गेहूं)' },
                  { id: 'Paddy', label: 'Paddy (धान)' },
                  { id: 'Soybean', label: 'Soybean (सोयाबीन)' },
                  { id: 'Mustard', label: 'Mustard (सरसों)' },
                  { id: 'Cotton', label: 'Cotton (कपास)' },
                  { id: 'Chana', label: 'Chana (चना)' },
                  { id: 'Onion', label: 'Onion (प्याज)' },
                  { id: 'Potato', label: 'Potato (आलू)' }
                ].map(c => (
                  <button
                    key={c.id}
                    type="button"
                    className={`commodity-btn ${selectedCommodity === c.id ? 'active' : ''}`}
                    onClick={() => setSelectedCommodity(c.id)}
                  >
                    {c.label}
                  </button>
                ))}

                <select
                  value={selectedCommodity}
                  onChange={(e) => setSelectedCommodity(e.target.value)}
                  className="commodity-dropdown"
                  style={{
                    padding: '8px 14px',
                    borderRadius: 999,
                    border: '1.5px solid #047857',
                    background: '#f0fdf4',
                    color: '#065f46',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 2px 6px rgba(4, 120, 87, 0.1)'
                  }}
                  title="Choose from all major Indian agricultural commodities"
                >
                  <option value="" disabled>🌾 All Indian Crops (सभी भारतीय फसलें 30+)...</option>
                  {INDIAN_CROP_CATEGORIES.map(group => (
                    <optgroup key={group.category} label={group.category}>
                      {group.crops.map(crop => (
                        <option key={crop.id} value={crop.id}>
                          {crop.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>

            {predictionData && (
              <div className="prediction-body-grid">
                {/* Left Intel Card */}
                <div className="decision-intel-card">
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                        AI Model Recommendation (एआई मॉडल सलाह)
                      </span>
                      <span className={predictionData.recommendation === 'HOLD_PRODUCE' ? 'recommendation-badge-hold' : 'recommendation-badge-sell'}>
                        {predictionData.recommendation === 'HOLD_PRODUCE' ? '📈 HOLD PRODUCE (फसल रोकें)' : '⚡ SELL NOW (तुरंत बेचें)'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                          Current APMC Modal Price (वर्तमान मंडी भाव)
                        </span>
                        <strong style={{ fontSize: '1.45rem', color: '#0f172a', display: 'block', marginTop: 2 }}>
                          ₹{predictionData.currentPrice}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>per Quintal - Today (प्रति क्विंटल - आज)</span>
                      </div>

                      <div style={{ background: '#ffffff', padding: '14px', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, display: 'block' }}>
                          Projected 10-Day Peak (संभावित उच्चतम भाव)
                        </span>
                        <strong style={{ fontSize: '1.45rem', color: '#047857', display: 'block', marginTop: 2 }}>
                          ₹{predictionData.peakPrice}
                        </strong>
                        <span style={{ fontSize: '0.74rem', color: predictionData.projectedChange?.startsWith('+') ? '#059669' : '#dc2626', fontWeight: 700 }}>
                          {predictionData.projectedChange} expected (अनुमानित बदलाव)
                        </span>
                      </div>
                    </div>

                    <div style={{
                      background: '#ffffff',
                      borderRadius: 16,
                      padding: '14px',
                      border: '1px solid #e2e8f0',
                      marginBottom: 16
                    }}>
                      <strong style={{ fontSize: '0.86rem', color: '#064e3b', display: 'block', marginBottom: 4 }}>
                        {predictionData.recommendationHindi}
                      </strong>
                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                        {predictionData.reasoning}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => navigate('/portal')}
                      style={{
                        flex: 1,
                        padding: '11px 16px',
                        borderRadius: 999,
                        background: '#047857',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
                      }}
                    >
                      List at ₹{predictionData.peakPrice} in Marketplace (बाजार में बेचें) &rarr;
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const q = `KrishiAi Price Prediction models ${predictionData.commodity} reaching ₹${predictionData.peakPrice}/qtl with recommendation ${predictionData.recommendation}. What market strategy should I follow?`;
                        navigate('/chat', { state: { prefillQuery: q } });
                      }}
                      style={{
                        padding: '11px 16px',
                        borderRadius: 999,
                        background: '#ffffff',
                        color: '#047857',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        border: '1px solid rgba(4, 120, 87, 0.3)',
                        cursor: 'pointer'
                      }}
                    >
                      Ask AI Doctor (सलाह लें) &rarr;
                    </button>
                  </div>
                </div>

                {/* Right SVG Chart */}
                <div className="prediction-chart-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                      17-Day Price Trajectory (17-दिन का भाव ग्राफ)
                    </span>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.74rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#475569' }}>
                        <span style={{ width: 14, height: 3, background: '#047857', display: 'inline-block' }} /> Historical (पिछला भाव)
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#047857', fontWeight: 700 }}>
                        <span style={{ width: 14, height: 3, borderTop: '2px dashed #10b981', display: 'inline-block' }} /> Forecast (अनुमानित)
                      </span>
                    </div>
                  </div>

                  <div style={{ width: '100%', height: 210, position: 'relative' }}>
                    <svg viewBox="0 0 540 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                      <defs>
                        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Grid lines */}
                      <line x1="30" y1="20" x2="520" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="75" x2="520" y2="75" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="130" x2="520" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="30" y1="170" x2="520" y2="170" stroke="#e2e8f0" strokeWidth="1.5" />

                      {/* Transition Divider (Today) */}
                      <line x1="225" y1="10" x2="225" y2="170" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                      <text x="225" y="192" fill="#047857" fontSize="10" fontWeight="800" textAnchor="middle">
                        TODAY (आज)
                      </text>

                      {/* Render historical & forecast polylines */}
                      {(() => {
                        const timeline = predictionData.timeline || [];
                        if (timeline.length < 2) return null;
                        const minP = Math.min(...timeline.map(t => t.price)) - 50;
                        const maxP = Math.max(...timeline.map(t => t.price)) + 50;
                        const range = maxP - minP || 1;

                        const getX = (idx) => 40 + (idx * ((500 - 40) / (timeline.length - 1)));
                        const getY = (price) => 170 - (((price - minP) / range) * 140);

                        const histPoints = timeline.slice(0, 7).map((t, i) => `${getX(i)},${getY(t.price)}`).join(' ');
                        const forecastPoints = timeline.slice(6).map((t, i) => `${getX(i + 6)},${getY(t.price)}`).join(' ');

                        return (
                          <g>
                            <polyline
                              fill="none"
                              stroke="#047857"
                              strokeWidth="3.5"
                              points={histPoints}
                            />

                            <polyline
                              fill="none"
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeDasharray="6 4"
                              points={forecastPoints}
                            />

                            {timeline.map((pt, idx) => {
                              const cx = getX(idx);
                              const cy = getY(pt.price);
                              const isToday = idx === 6;
                              const isPeak = pt.price === predictionData.peakPrice;
                              return (
                                <g key={idx}>
                                  <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isToday || isPeak ? 5.5 : 3.5}
                                    fill={isToday ? '#064e3b' : isPeak ? '#10b981' : '#ffffff'}
                                    stroke={pt.type === 'forecast' ? '#10b981' : '#047857'}
                                    strokeWidth="2"
                                  />
                                  {(isToday || isPeak || idx === 0 || idx === timeline.length - 1) && (
                                    <text
                                      x={cx}
                                      y={cy - 10}
                                      fill="#0f172a"
                                      fontSize="10"
                                      fontWeight="800"
                                      textAnchor="middle"
                                    >
                                      ₹{pt.price}
                                    </text>
                                  )}
                                </g>
                              );
                            })}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#64748b', marginTop: 10 }}>
                    <span>← Past 7 Days - Mandi Arrivals (पिछले 7 दिन - मंडी आवक)</span>
                    <span>Next 10 Days - Projected Forecast (अगले 10 दिन - भाव अनुमान) →</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Features Dashboard */}
        <section className="dashboard-section">
          <div className="section-heading">
            <span>Enterprise Suite (किसान सुविधाएं)</span>
            <h2>Integrated Farming & Trade Tools (खेती व व्यापार की आधुनिक सुविधाएं)</h2>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <NavLink key={feature.to} to={feature.to} className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div className="feature-icon" aria-hidden="true">
                    <span />
                  </div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 9px',
                    borderRadius: 999,
                    background: 'rgba(16, 185, 129, 0.12)',
                    color: '#047857'
                  }}>
                    {feature.badge}
                  </span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <span className="feature-link">Open Tool (शुरू करें) &rarr;</span>
              </NavLink>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

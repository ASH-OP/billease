/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaReceipt, FaShieldAlt, FaStore, FaUser } from 'react-icons/fa';
import { ArrowRight, Zap } from 'lucide-react';

export const UserType = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const cards = [
    {
      label: 'Customer',
      subtitle: 'I want to manage my receipts & warranties',
      icon: <FaUser className="text-white text-xl" />,
      features: ['Store & view all your bills', 'Track warranty expiry', 'Claim warranty in one click'],
      gradient: 'from-orange-500 to-orange-600',
      accent: 'bg-orange-50 text-orange-600 border-orange-100',
      glow: 'hover:shadow-orange-100',
      action: () => navigate('/customerLogin'),
    },
    {
      label: 'Retailer',
      subtitle: 'I want to send bills to customers',
      icon: <FaStore className="text-white text-xl" />,
      features: ['Create digital invoices', 'Send bills instantly', 'View analytics & reports'],
      gradient: 'from-slate-700 to-slate-800',
      accent: 'bg-slate-50 text-slate-700 border-slate-100',
      glow: 'hover:shadow-slate-100',
      action: () => navigate('/retailerLogin'),
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12 transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-indigo-200/20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo + heading */}
        <div className="text-center mb-12">
          <img src="/logo-orange.png" alt="BillEase" className="w-16 h-auto mx-auto mb-4" />
          <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 text-orange-600 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            <Zap size={11} /> Welcome to BillEase
          </div>
          <h1 className="text-4xl font-black text-gray-900 leading-tight">
            Who are you?
          </h1>
          <p className="text-gray-500 mt-2 text-base">Choose how you'd like to use BillEase</p>
        </div>

        {/* Role cards */}
        <div className="grid sm:grid-cols-2 gap-5">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={card.action}
              className={`group relative text-left bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl ${card.glow} hover:-translate-y-1 transition-all duration-200 overflow-hidden p-6 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2`}
            >
              {/* Top gradient bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 shadow-md`}>
                {card.icon}
              </div>

              {/* Text */}
              <h2 className="text-xl font-black text-gray-900 mb-1">
                {card.label}
              </h2>
              <p className="text-gray-500 text-sm mb-5 leading-relaxed">{card.subtitle}</p>

              {/* Feature list */}
              <ul className="space-y-2 mb-5">
                {card.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${card.gradient} flex-shrink-0`} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA row */}
              <div className={`flex items-center gap-1.5 text-sm font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent group-hover:gap-2.5 transition-all`}>
                Continue as {card.label}
                <ArrowRight size={14} className="text-orange-500 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          New here?{' '}
          <button onClick={() => navigate('/CustomerRegister')} className="text-orange-500 font-bold hover:underline">
            Create a free customer account
          </button>
        </p>
      </div>
    </div>
  );
};
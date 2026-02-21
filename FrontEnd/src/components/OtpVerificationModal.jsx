// src/components/OtpVerificationModal.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { FaEnvelope, FaSpinner, FaShieldAlt, FaRedo } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { customerApi } from '../services/api';

const RESEND_COOLDOWN = 30; // seconds

const OtpVerificationModal = ({ isOpen, email, onVerified, onClose, onResend }) => {
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Start cooldown timer
    const startCooldown = useCallback(() => {
        setCooldown(RESEND_COOLDOWN);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setDigits(['', '', '', '', '', '']);
            startCooldown();
            // Auto-focus first box after open animation settles
            setTimeout(() => inputRefs.current[0]?.focus(), 120);
        }
    }, [isOpen, startCooldown]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setTimeout(() => setCooldown(c => c - 1), 1000);
        return () => clearTimeout(id);
    }, [cooldown]);

    const handleChange = (index, value) => {
        const digit = value.replace(/\D/g, '').slice(-1);
        const next = [...digits];
        next[index] = digit;
        setDigits(next);
        if (digit && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setDigits(pasted.split(''));
            inputRefs.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const otp = digits.join('');
        if (otp.length < 6) { toast.error('Please enter all 6 digits.'); return; }

        setIsVerifying(true);
        try {
            const { data } = await customerApi.post('/auth/verify-otp', { email, otp });
            if (data.success) {
                toast.success('Email verified!');
                onVerified(data.verificationToken);
            } else {
                toast.error(data.message || 'Invalid OTP.');
                setDigits(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to verify. Please try again.');
            setDigits(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0 || isResending) return;
        setIsResending(true);
        try {
            await onResend();
            setDigits(['', '', '', '', '', '']);
            startCooldown();
            inputRefs.current[0]?.focus();
            toast.success('New OTP sent!');
        } catch {
            toast.error('Failed to resend OTP.');
        } finally {
            setIsResending(false);
        }
    };

    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <>
            <style>{`
                .otp-overlay {
                    position: fixed; inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 9999;
                    display: flex; align-items: center; justify-content: center;
                    padding: 16px;
                    animation: otp-fade-in 0.2s ease;
                }
                @keyframes otp-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                .otp-card {
                    background: #ffffff;
                    border-radius: 24px;
                    padding: 40px 36px;
                    width: 100%; max-width: 420px;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.25);
                    animation: otp-slide-up 0.25s cubic-bezier(0.4,0,0.2,1);
                    text-align: center;
                }
                @keyframes otp-slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .otp-icon-ring {
                    width: 68px; height: 68px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #fff7ed, #ffedd5);
                    border: 2px solid #fed7aa;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 20px;
                    box-shadow: 0 4px 16px rgba(249,115,22,0.2);
                }
                .otp-digit {
                    width: 50px; height: 58px;
                    border: 2px solid #e5e7eb;
                    border-radius: 14px;
                    text-align: center;
                    font-size: 1.6rem;
                    font-weight: 800;
                    color: #1f2937;
                    background: #f9fafb;
                    outline: none;
                    transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
                    caret-color: transparent;
                }
                .otp-digit:focus {
                    border-color: #f97316;
                    background: #fff7ed;
                    box-shadow: 0 0 0 3px rgba(249,115,22,0.18);
                }
                .otp-digit:not(:placeholder-shown) {
                    border-color: #fb923c;
                    background: #fff7ed;
                    color: #ea580c;
                }
                .otp-verify-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: #fff;
                    font-size: 0.95rem;
                    font-weight: 700;
                    border: none;
                    cursor: pointer;
                    transition: opacity 0.18s ease, transform 0.18s ease;
                    box-shadow: 0 4px 18px rgba(249,115,22,0.35);
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }
                .otp-verify-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.93; }
                .otp-verify-btn:disabled { opacity: 0.6; cursor: not-allowed; }
                .otp-resend-btn {
                    background: none; border: none;
                    color: #f97316; font-size: 0.82rem; font-weight: 600;
                    cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
                    transition: color 0.15s ease;
                }
                .otp-resend-btn:hover:not(:disabled) { color: #ea580c; }
                .otp-resend-btn:disabled { color: #9ca3af; cursor: default; }
            `}</style>

            <div className="otp-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
                <div className="otp-card">
                    {/* Icon */}
                    <div className="otp-icon-ring">
                        <FaEnvelope style={{ fontSize: '1.6rem', color: '#f97316' }} />
                    </div>

                    {/* Heading */}
                    <h2 style={{ margin: '0 0 8px', fontSize: '1.35rem', fontWeight: 900, color: '#111827' }}>
                        Verify your email
                    </h2>
                    <p style={{ margin: '0 0 6px', fontSize: '0.85rem', color: '#6b7280', lineHeight: 1.5 }}>
                        We sent a 6-digit code to
                    </p>
                    <p style={{ margin: '0 0 28px', fontSize: '0.9rem', fontWeight: 700, color: '#f97316' }}>
                        {email}
                    </p>

                    {/* OTP Inputs */}
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
                        {digits.map((d, i) => (
                            <input
                                key={i}
                                ref={el => inputRefs.current[i] = el}
                                className="otp-digit"
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                placeholder="·"
                                value={d}
                                onChange={e => handleChange(i, e.target.value)}
                                onKeyDown={e => handleKeyDown(i, e)}
                                onPaste={i === 0 ? handlePaste : undefined}
                                disabled={isVerifying}
                            />
                        ))}
                    </div>

                    {/* Verify Button */}
                    <button
                        className="otp-verify-btn"
                        onClick={handleVerify}
                        disabled={isVerifying || digits.join('').length < 6}
                    >
                        {isVerifying
                            ? <><FaSpinner style={{ animation: 'spin 1s linear infinite' }} /> Verifying...</>
                            : <><FaShieldAlt /> Verify & Continue</>
                        }
                    </button>

                    {/* Resend */}
                    <div style={{ marginTop: '20px', color: '#9ca3af', fontSize: '0.82rem' }}>
                        Didn't receive it?{' '}
                        <button
                            className="otp-resend-btn"
                            onClick={handleResend}
                            disabled={cooldown > 0 || isResending}
                        >
                            {isResending
                                ? <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                                : <FaRedo style={{ fontSize: '0.7rem' }} />
                            }
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                        </button>
                    </div>

                    <style>{`
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            </div>
        </>,
        document.body
    );
};

export default OtpVerificationModal;

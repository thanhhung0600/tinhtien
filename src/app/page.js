"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormLogic } from './useFormLogic';

export default function FormNhapLieu() {
    const {
        currentStep,
        formData,
        handleInputChange,
        nextStep,
        prevStep,
        steps,
        totalSteps,
        isSubmitting,
        errorToast,
        successToast,
        inputRef
    } = useFormLogic();

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f7ff] p-4 font-sans relative">
            
            {/* HỆ THỐNG THÔNG BÁO SIÊU THON GỌN ĐÃ GIẢM CHIỀU RỘNG (max-w-[280px]) */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[99999] pointer-events-none w-full max-w-[280px] px-4 flex flex-col gap-2">
                <AnimatePresence>
                    {/* Thông báo Lỗi - Màu Đỏ */}
                    {errorToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-red-500/95 backdrop-blur-md text-white text-[12px] font-medium px-4 py-2 rounded-xl shadow-md flex items-center justify-center gap-2 text-center pointer-events-auto"
                        >
                            <span>⚠️</span>
                            <span className="truncate">{errorToast}</span>
                        </motion.div>
                    )}

                    {/* Thông báo Thành công - Màu Xanh Lá */}
                    {successToast && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="bg-emerald-500/95 backdrop-blur-md text-white text-[12px] font-medium px-4 py-2 rounded-xl shadow-md flex items-center justify-center gap-2 text-center pointer-events-auto"
                        >
                            {/* <span>✅</span> */}
                            <span className="truncate">{successToast}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* CONTAINER FORM ĐÃ ĐƯỢC THU NHỎ CHIỀU RỘNG (max-w-[360px]) */}
            <div className="bg-white rounded-[32px] p-6 w-full max-w-[360px] shadow-[0_10px_30px_rgba(0,123,255,0.1)] relative overflow-hidden flex flex-col min-h-[400px]">
                <div className="relative flex-1 flex flex-col">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute inset-0 w-full flex flex-col"
                        >
                            <label className="block text-blue-600 text-[22px] font-black mb-4">
                                {steps[currentStep].label}
                            </label>
                            
                            <div className="flex-1">
                                {steps[currentStep].type === 'car-select' && (
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        {steps[currentStep].options.map((option) => {
                                            const isSelected = formData[steps[currentStep].id] === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onClick={() => {
                                                        handleInputChange(steps[currentStep].id, option.value);
                                                        setTimeout(() => nextStep(), 180);
                                                    }}
                                                    className={`py-2.5 px-3 rounded-xl text-[14px] font-bold border-2 text-center transition-all active:scale-95 flex items-center justify-center min-h-[46px] ${
                                                        isSelected
                                                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm'
                                                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                                                    }`}
                                                >
                                                    <span>{option.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {steps[currentStep].type === 'date' && (
                                    <input
                                        ref={inputRef}
                                        type="date"
                                        value={formData[steps[currentStep].id]}
                                        onChange={(e) => handleInputChange(steps[currentStep].id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                        className="w-full rounded-xl px-4 py-3 text-[15px] font-bold border-2 border-slate-100 bg-slate-50 outline-none transition-all focus:border-blue-500 focus:bg-white text-slate-700 appearance-none uppercase"
                                    />
                                )}

                                {(steps[currentStep].type === 'text' || steps[currentStep].type === 'number') && (
                                    <input
                                        ref={inputRef}
                                        type={steps[currentStep].type}
                                        placeholder={steps[currentStep].placeholder}
                                        value={formData[steps[currentStep].id]}
                                        onChange={(e) => handleInputChange(steps[currentStep].id, e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
                                        autoComplete="off"
                                        className="w-full rounded-xl px-4 py-3 text-[15px] font-bold border-2 border-slate-100 bg-slate-50 outline-none transition-all focus:border-blue-500 focus:bg-white text-slate-700 placeholder:text-slate-400"
                                    />
                                )}
                            </div>

                            {/* Thanh tiến trình */}
                            <div className="flex gap-1.5 w-full mt-5 mb-5 shrink-0">
                                {steps.map((step, index) => {
                                    const hasData = String(formData[step.id]).trim() !== "";
                                    const isCurrent = index === currentStep;
                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                                hasData || isCurrent ? 'bg-blue-500' : 'bg-blue-100'
                                            }`}
                                        />
                                    );
                                })}
                            </div>

                            {/* Hệ thống nút bấm điều hướng */}
                            <div className="flex items-center justify-between gap-3 mt-auto shrink-0">
                                {currentStep > 0 ? (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 px-5 rounded-xl active:scale-95 transition-all text-[14px]"
                                    >
                                        Quay lại
                                    </button>
                                ) : (
                                    <div />
                                )}

                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={isSubmitting}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-black py-3 px-8 rounded-xl shadow-md active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 text-[14px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : currentStep === totalSteps - 1 ? (
                                        "Hoàn thành"
                                    ) : (
                                        "Tiếp theo"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
"use client";
import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

export function useFormLogic() {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorToast, setErrorToast] = useState(""); // Thông báo lỗi
    const [successToast, setSuccessToast] = useState(""); // THÊM MỚI: Thông báo thành công
    const inputRef = useRef(null);

    const [formData, setFormData] = useState({
        loaiXe: '', 
        ngay: '',   
        noiDi: '',
        giaTien: '',
        xang: '',
        taiXe: '',
        hoaHong: ''
    });

    const steps = [
        { 
            id: 'loaiXe', 
            label: 'Chọn loại xe', 
            type: 'car-select',
            options: [
                { name: 'Xe 4 chỗ', value: 'Xe 4 chỗ' },
                { name: 'Xe 7 chỗ', value: 'Xe 7 chỗ' },
                { name: 'Xe Tải A', value: 'Xe Tải A' },
                { name: 'Xe Tải B', value: 'Xe Tải B' }
            ]
        },
        { id: 'ngay', label: 'Chọn ngày đi', type: 'date' },
        { id: 'noiDi', label: 'Nơi đi', type: 'text', placeholder: 'Ví dụ: Sài Gòn,...' },
        { id: 'giaTien', label: 'Giá tiền', type: 'text', placeholder: 'Nhập giá tiền...' },
        { id: 'xang', label: 'Giá xăng', type: 'text', placeholder: 'Nhập tiền xăng...' },
        { id: 'taiXe', label: 'Tài xế', type: 'text', placeholder: 'Thái' },
        { id: 'hoaHong', label: 'Hoa hồng', type: 'text', placeholder: 'Nhập tiền hoa hồng...' }
    ];

    const totalSteps = steps.length;

    useEffect(() => {
        if (inputRef.current && steps[currentStep].type !== 'car-select') {
            setTimeout(() => inputRef.current.focus(), 100);
        }
    }, [currentStep]);

    // Tự động xóa thông báo lỗi sau 3 giây
    useEffect(() => {
        if (errorToast) {
            const timer = setTimeout(() => setErrorToast(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [errorToast]);

    // THÊM MỚI: Tự động xóa thông báo thành công sau 2.5 giây
    useEffect(() => {
        if (successToast) {
            const timer = setTimeout(() => setSuccessToast(""), 2500);
            return () => clearTimeout(timer);
        }
    }, [successToast]);

    const handleInputChange = (id, value) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const prevStep = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const focusCurrentInput = () => {
        if (inputRef.current) {
            inputRef.current.focus({ preventScroll: true });
        }
    };

    const nextStep = async () => {
        if (currentStep < totalSteps - 1) {
            const nextStepIndex = currentStep + 1;

            flushSync(() => {
                setCurrentStep(nextStepIndex);
            });

            if (steps[nextStepIndex].type !== 'car-select') {
                focusCurrentInput();
            }
        } else {
            await submitToGoogleSheet();
        }
    };

    const submitToGoogleSheet = async () => {
        setIsSubmitting(true);
        setErrorToast("");
        setSuccessToast(""); // Xóa thông báo cũ trước khi gửi
        try {
            const response = await fetch('/api/google-sheet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            if (result.success) {
                // 1. HIỂN THỊ THÔNG BÁO XANH LÊN WEB LIỀN
                setSuccessToast("✔ Đã nhập dữ liệu thành công!");

                // 2. LẬP TỨC XOÁ TRẮNG FORM VÀ QUAY VỀ BƯỚC ĐẦU TIÊN (KHÔNG ĐỢI TRỄ)
                setFormData({
                    loaiXe: '',
                    ngay: '',   
                    noiDi: '',
                    giaTien: '',
                    xang: '',
                    taiXe: '',
                    hoaHong: ''
                });
                setCurrentStep(0); 

            } else {
                setErrorToast("Lỗi kết nối Google: " + result.error);
            }
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
            setErrorToast("Không thể kết nối đến máy chủ Node.js!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        currentStep,
        formData,
        handleInputChange,
        nextStep,
        prevStep,
        steps,
        totalSteps,
        isSubmitting,
        errorToast,
        successToast, // Truyền biến success xuống UI
        inputRef
    };
}

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { DomainFormData } from "@/types/domain";

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DomainFormData) => void;
  isLoading: boolean;
}

export const AddDomainModal: React.FC<AddDomainModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState<DomainFormData>({
    domain: "",
    type: "CUSTOM",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, domain: e.target.value });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      type: e.target.value as "CUSTOM" | "SUBDOMAIN",
    });
  };

  const handleSubmit = () => {
    if (!formData.domain.trim()) {
      return;
    }
    onSubmit({
      domain: formData.domain.trim(),
      type: formData.type,
    });
  };

  const handleClose = () => {
    setFormData({ domain: "", type: "CUSTOM" });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="افزودن دامنه جدید">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نام دامنه
          </label>
          <input
            value={formData.domain}
            onChange={handleInputChange}
            placeholder="example.com یا booking.example.com"
            className="w-full h-11 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            type="text"
            autoComplete="off"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            مثال: booking.mybusiness.com یا widget.mybusiness.com
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            نوع دامنه
          </label>
          <select
            value={formData.type}
            onChange={handleTypeChange}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="CUSTOM">دامنه سفارشی</option>
            <option value="SUBDOMAIN">زیردامنه</option>
          </select>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            نکات مهم:
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• دامنه باید در اختیار شما باشد</li>
            <li>• پس از افزودن، باید رکوردهای DNS را تنظیم کنید</li>
            <li>• حداکثر 5 دامنه می‌توانید اضافه کنید</li>
            <li>• تغییرات DNS ممکن است تا 48 ساعت طول بکشد</li>
          </ul>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} className="px-6 py-2">
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.domain.trim()}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            {isLoading ? "در حال افزودن..." : "افزودن دامنه"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

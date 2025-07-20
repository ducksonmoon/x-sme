import React from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Domain, DomainInstructions } from "@/types/domain";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: Domain | null;
  instructions: DomainInstructions | null;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  domain,
  instructions,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`راهنمای تنظیم DNS برای ${domain?.domain}`}
    >
      {instructions ? (
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
              رکوردهای DNS مورد نیاز:
            </h4>
            <div className="space-y-3">
              {instructions.records?.map((record, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-3 rounded border"
                >
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        نوع:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {record.type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        نام:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {record.name}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        مقدار:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono text-xs">
                        {record.value}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {record.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              مراحل تنظیم:
            </h4>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              {instructions.instructions?.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
              نکات مهم:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
              {instructions.notes?.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
            >
              متوجه شدم
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            در حال بارگذاری راهنما...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            لطفاً صبر کنید تا اطلاعات راهنما بارگذاری شود.
          </p>
        </div>
      )}
    </Modal>
  );
};

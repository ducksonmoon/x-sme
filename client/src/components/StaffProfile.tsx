import React from "react";
import { Staff } from "../types";
import { Card } from "./ui/card";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Calendar, Clock, Phone, Mail, Star, User } from "lucide-react";

interface StaffProfileProps {
  staff: Staff;
  showSchedule?: boolean;
}

const DAYS_OF_WEEK = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
  "شنبه",
];

export const StaffProfile: React.FC<StaffProfileProps> = ({
  staff,
  showSchedule = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="h-20 w-20">
            {staff.avatar ? (
              <img
                src={staff.avatar}
                alt={`${staff.firstName} ${staff.lastName}`}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center h-full w-full text-white font-bold text-xl">
                {staff.firstName.charAt(0)}
                {staff.lastName.charAt(0)}
              </div>
            )}
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                {staff.firstName} {staff.lastName}
              </h2>
              <Badge
                variant={staff.isActive ? "default" : "secondary"}
                className={
                  staff.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }
              >
                {staff.isActive ? "فعال" : "غیرفعال"}
              </Badge>
            </div>

            {staff.specialization && (
              <p className="text-lg text-blue-600 font-medium mb-3">
                {staff.specialization}
              </p>
            )}

            {staff.bio && <p className="text-gray-600 mb-4">{staff.bio}</p>}

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {staff.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{staff.email}</span>
                </div>
              )}
              {staff.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{staff.phone}</span>
                </div>
              )}
              {staff.experience && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>{staff.experience}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Services */}
      {staff.services && staff.services.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            خدمات ارائه‌شده
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.services.map((service) => (
              <div key={service.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">
                    {service.service.name}
                  </h4>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {service.customPrice
                        ? service.customPrice.toLocaleString()
                        : service.service.price.toLocaleString()}{" "}
                      تومان
                    </div>
                    {service.customPrice && (
                      <div className="text-xs text-blue-600">قیمت خاص</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  مدت زمان: {service.service.duration} دقیقه
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Working Hours */}
      {showSchedule && staff.workingHours && staff.workingHours.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ساعات کاری
          </h3>
          <div className="space-y-3">
            {staff.workingHours
              .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
              .map((workingHour) => (
                <div
                  key={workingHour.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="font-medium text-gray-900">
                    {DAYS_OF_WEEK[workingHour.dayOfWeek]}
                  </div>
                  <div className="text-gray-600">
                    {workingHour.startTime} - {workingHour.endTime}
                  </div>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          آمار
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {staff._count?.bookings || 0}
            </div>
            <div className="text-sm text-gray-600">کل رزروها</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {staff.services?.length || 0}
            </div>
            <div className="text-sm text-gray-600">خدمات</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {staff.workingHours?.length || 0}
            </div>
            <div className="text-sm text-gray-600">روزهای کاری</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {staff.isActive ? "✓" : "✗"}
            </div>
            <div className="text-sm text-gray-600">وضعیت</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

const contactInfo = [
  { icon: Phone, label: "تلفن", value: "۰۲۱-۱۲۳۴۵۶۷۸" },
  { icon: Mail, label: "ایمیل", value: "info@marikh.co" },
  { icon: MapPin, label: "آدرس", value: "تهران، ایران" },
];

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="overflow-hidden">
      <section className="py-20 md:py-28 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              تماس با ما
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              درباره پروژه وب‌سایت، نرم‌افزار یا راهکار هوش مصنوعی خود با ما
              صحبت کنید.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="space-y-6">
              {contactInfo.map((item) => (
                <Card key={item.label} className="border-gray-200">
                  <CardContent className="flex items-center gap-4 py-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p className="font-medium text-gray-900">
                        {item.value}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle>ارسال پیام</CardTitle>
                  <CardDescription>
                    فرم زیر را پر کنید، در اسرع وقت با شما تماس می‌گیریم.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                      <p className="text-lg font-medium text-gray-900">
                        پیام شما با موفقیت ارسال شد.
                      </p>
                      <p className="text-gray-600 mt-2">
                        به زودی با شما تماس خواهیم گرفت.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            نام و نام خانوادگی
                          </label>
                          <Input
                            name="name"
                            required
                            value={form.name}
                            onChange={handleChange}
                            placeholder="نام شما"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            ایمیل
                          </label>
                          <Input
                            type="email"
                            name="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@company.com"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          پیام شما
                        </label>
                        <textarea
                          name="message"
                          required
                          rows={5}
                          value={form.message}
                          onChange={handleChange}
                          placeholder="درباره پروژه خود بنویسید..."
                          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        ارسال پیام
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;

import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@components/ui/button";
import { services } from "@/data/site";

const Services: React.FC = () => {
  return (
    <div className="overflow-hidden">
      <section className="py-20 md:py-28 bg-paper">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-ink mb-6">
              خدمات سفارشی
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              فراتر از محصولات آماده، پروژه اختصاصی خودتان را با تیم مریخ
              بسازید — از وب‌سایت تا نرم‌افزار، اپلیکیشن و هوش مصنوعی.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="border border-line rounded-md p-8"
              >
                <div className="w-11 h-11 rounded-lg bg-mars-tint flex items-center justify-center mb-5">
                  <service.icon className="w-5 h-5 text-mars-dark" />
                </div>
                <h2 className="text-lg font-bold text-ink mb-2.5">
                  {service.title}
                </h2>
                <p className="text-sm text-ink-soft leading-relaxed mb-5">
                  {service.description}
                </p>
                <div className="flex flex-col gap-2.5">
                  {service.details.map((detail) => (
                    <div key={detail} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-mars-dark mt-0.5 shrink-0" />
                      <span className="text-sm text-ink-soft">{detail}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-paper border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-ink mb-4">
            پروژه‌تان را با ما شروع کنید
          </h2>
          <p className="text-ink-soft mb-8">
            برایمان بنویسید چه نیاز دارید، بهترین راهکار را پیشنهاد می‌دهیم.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper"
          >
            <Link to="/contact" className="flex items-center gap-2">
              تماس با ما
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Services;

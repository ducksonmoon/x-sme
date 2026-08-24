import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { portfolio } from "@/data/site";

const MotionLink = motion(Link);

const Portfolio: React.FC = () => {
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
              نمونه‌کارها
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed">
              پروژه‌هایی که برای کسب‌وکارهای واقعی ساخته‌ایم.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolio.map((item, index) => (
              <MotionLink
                key={item.slug}
                to={`/portfolio/${item.slug}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group flex flex-col gap-4 border border-line rounded-md p-6 hover:border-mars/40 hover:bg-mars-tint/20 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-lg font-bold text-ink">{item.name}</span>
                  <ArrowLeft className="w-4 h-4 text-mars-dark shrink-0 transition-transform group-hover:-translate-x-1" />
                </div>
                <p className="text-sm text-ink-soft leading-relaxed flex-1">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium text-mars-dark bg-mars-tint px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </MotionLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;

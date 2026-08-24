import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@components/ui/button";
import { portfolio } from "@/data/site";
import NotFound from "./NotFound";

const PortfolioDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const item = portfolio.find((p) => p.slug === slug);

  if (!item) {
    return <NotFound />;
  }

  return (
    <div className="overflow-hidden">
      <section className="py-20 md:py-28 bg-paper">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-2 text-sm font-medium text-ink-soft hover:text-mars-dark transition-colors mb-8"
          >
            <ArrowRight className="w-4 h-4" />
            بازگشت به نمونه‌کارها
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap gap-1.5 mb-5">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-mars-dark bg-mars-tint px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-5">
              {item.name}
            </h1>
            <p className="text-lg text-ink-soft leading-relaxed mb-8">
              {item.about}
            </p>
            <Button asChild size="lg" className="bg-mars text-paper hover:bg-[oklch(62%_0.15_35)] hover:text-paper">
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                بازدید از سایت
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white border-t border-line-soft">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-ink mb-4">
            پروژه مشابهی در ذهن دارید؟
          </h2>
          <p className="text-ink-soft mb-8">
            برایمان بنویسید چه نیاز دارید، بهترین راهکار را پیشنهاد می‌دهیم.
          </p>
          <Button asChild size="lg" variant="outline" className="border-line text-ink hover:border-navy-700">
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

export default PortfolioDetail;

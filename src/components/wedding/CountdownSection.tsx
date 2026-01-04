import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownSection = () => {
  // Set wedding date - you can change this
  const weddingDate = new Date("2025-09-15T14:00:00");

  const calculateTimeLeft = (): TimeLeft => {
    const difference = +weddingDate - +new Date();

    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeBlocks = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="wedding-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center"
      >
        <h2 className="wedding-subheading mb-4">Save the Date</h2>
        <p className="wedding-heading mb-12">September 15, 2025</p>

        <div className="wedding-divider mx-auto" />

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-12">
          {timeBlocks.map((block, index) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="wedding-card min-w-[80px] md:min-w-[120px]"
            >
              <motion.span
                key={block.value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="block text-3xl md:text-5xl font-serif text-primary"
              >
                {String(block.value).padStart(2, "0")}
              </motion.span>
              <span className="block text-xs md:text-sm uppercase tracking-widest text-foreground/60 mt-2 font-sans">
                {block.label}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default CountdownSection;

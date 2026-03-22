import { motion } from "framer-motion";
import { Heart, Utensils, Camera, Sparkles, Cake, Martini } from "lucide-react";

const agendaItems = [
  {
    time: "17:30",
    title: "Коктейл за добре дошли",
    description: "Започваме спокойно, с чаша в ръка",
    icon: Martini,
  },
  {
    time: "18:30",
    title: "Ритуал",
    description: "Началото на нашето завинаги",
    icon: Sparkles,
  },
  {
    time: "19:00",
    title: "Снимки и поздравления",
    description: "Прегръдки, снимки и хубави думи",
    icon: Camera,
  },
  {
    time: "20:00",
    title: "Вечеря",
    description: "Тристепенно меню, наздравици и споделени мигове",
    icon: Utensils,
  },
  {
    time: "22:00",
    title: "Торта",
    description: "Сладък момент преди вечерта да ускори ритъма",
    icon: Cake,
  },
];

const AgendaSection = () => {
  return (
    <section id="agenda" className="wedding-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center max-w-3xl mx-auto w-full"
      >
        <h2 className="wedding-subheading mb-4">The Day</h2>
        <h3 className="wedding-heading mb-8">Програма</h3>

        <div className="wedding-divider mx-auto" />

        <div className="mt-12 space-y-0">
          {agendaItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Timeline line */}
              {index !== agendaItems.length - 1 && (
                <div className="absolute left-1/2 top-full w-px h-8 bg-gradient-to-b from-primary/50 to-transparent -translate-x-1/2" />
              )}

              <div className="wedding-card mb-8 hover:border-primary/40 transition-all duration-300">
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                  {/* Time */}
                  <div className="md:w-24 flex-shrink-0">
                    <span className="text-primary font-serif text-xl">
                      {item.time}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="text-center md:text-left flex-grow">
                    <h4 className="text-xl font-serif text-foreground mb-1">
                      {item.title}
                    </h4>
                    <p className="text-foreground/60 text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default AgendaSection;

import { motion } from "framer-motion";
import { Heart, Utensils, Music, Camera, Sparkles } from "lucide-react";

const agendaItems = [
  {
    time: "2:00 PM",
    title: "Ceremony",
    description: "Exchange of vows in the garden",
    icon: Heart,
  },
  {
    time: "3:00 PM",
    title: "Cocktail Hour",
    description: "Drinks and canapés on the terrace",
    icon: Sparkles,
  },
  {
    time: "4:00 PM",
    title: "Photo Session",
    description: "Capturing memories with loved ones",
    icon: Camera,
  },
  {
    time: "5:00 PM",
    title: "Dinner",
    description: "Three-course dinner in the ballroom",
    icon: Utensils,
  },
  {
    time: "7:00 PM",
    title: "First Dance & Party",
    description: "Dance the night away!",
    icon: Music,
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
        <h3 className="wedding-heading mb-8">Agenda</h3>

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

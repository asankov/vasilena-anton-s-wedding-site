import { motion } from "framer-motion";
import { MapPin, Clock, Car } from "lucide-react";

const LocationSection = () => {
  return (
    <section id="location" className="wedding-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center max-w-4xl mx-auto"
      >
        <h2 className="wedding-subheading mb-4">The Venue</h2>
        <h3 className="wedding-heading mb-8">Location</h3>

        <div className="wedding-divider mx-auto" />

        <div className="wedding-card mt-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Venue Info */}
            <div className="text-left space-y-6">
              <div>
                <h4 className="text-2xl font-serif text-primary mb-2">
                  The Grand Estate
                </h4>
                <p className="wedding-text">
                  A beautiful historic venue nestled in the countryside,
                  offering breathtaking views and elegant surroundings for our
                  special day.
                </p>
              </div>

              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Address</p>
                  <p className="text-foreground/70 text-sm">
                    123 Wedding Lane
                    <br />
                    Sofia, Bulgaria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Ceremony Time</p>
                  <p className="text-foreground/70 text-sm">2:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Car className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-foreground font-medium">Parking</p>
                  <p className="text-foreground/70 text-sm">
                    Free parking available on-site
                  </p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative h-64 md:h-auto min-h-[250px] rounded-lg overflow-hidden bg-navy-light/50 flex items-center justify-center border border-primary/20">
              <div className="text-center p-4">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-foreground/60 text-sm">
                  Interactive map will be available soon
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-primary hover:text-rose-light transition-colors text-sm underline underline-offset-4"
                >
                  Open in Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default LocationSection;

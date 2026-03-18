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
        className="text-center max-w-4xl mx-auto">

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
                  <p className="text-foreground/70 text-sm">Wild Hill, Shumnatoto tepe 2, Ihtiman 

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

            {/* Map */}
            <div className="relative h-64 md:h-auto min-h-[250px] rounded-lg overflow-hidden border border-primary/20">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d188255.35199134797!2d23.4372868!3d42.5023966!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14ab3345a762a36b%3A0x478c0ffbc5d85ba0!2sWild%20Hill!5e0!3m2!1sen!2sbg!4v1773853561204!5m2!1sen!2sbg"
                width="100%"
                height="100%"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Wedding venue location"
              />
              <a
                href="https://maps.app.goo.gl/MfkQC2t6ajDM7VW58"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 bg-white/90 text-primary hover:text-rose-light transition-colors text-xs px-2 py-1 rounded shadow underline underline-offset-2">
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>);

};

export default LocationSection;

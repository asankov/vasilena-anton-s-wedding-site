import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";

interface RSVPData {
  name: string;
  attending: boolean | null;
  plusOne: boolean;
  mealChoice: string;
  accommodation: boolean;
  submitted: boolean;
}

const mealOptions = [
  { value: "", label: "Select your meal preference" },
  { value: "beef", label: "Beef Tenderloin" },
  { value: "chicken", label: "Herb-Roasted Chicken" },
  { value: "fish", label: "Pan-Seared Salmon" },
  { value: "vegetarian", label: "Vegetarian Risotto" },
  { value: "vegan", label: "Vegan Buddha Bowl" },
];

const RSVPSection = () => {
  const [rsvp, setRsvp] = useState<RSVPData>({
    name: "",
    attending: null,
    plusOne: false,
    mealChoice: "",
    accommodation: false,
    submitted: false,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("wedding-rsvp");
    if (saved) {
      setRsvp(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage on change
  const updateRsvp = (updates: Partial<RSVPData>) => {
    const newRsvp = { ...rsvp, ...updates };
    setRsvp(newRsvp);
    localStorage.setItem("wedding-rsvp", JSON.stringify(newRsvp));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRsvp({ submitted: true });
  };

  const resetForm = () => {
    const newRsvp: RSVPData = {
      name: "",
      attending: null,
      plusOne: false,
      mealChoice: "",
      accommodation: false,
      submitted: false,
    };
    setRsvp(newRsvp);
    localStorage.removeItem("wedding-rsvp");
  };

  if (rsvp.submitted) {
    return (
      <section id="rsvp" className="wedding-section">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="wedding-card">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h3 className="wedding-heading text-3xl mb-4">Thank You!</h3>
            <p className="wedding-text mb-6">
              {rsvp.attending
                ? `We can't wait to celebrate with you${rsvp.plusOne ? " and your guest" : ""}!`
                : "We're sorry you can't make it. You'll be missed!"}
            </p>
            {rsvp.attending && (
              <div className="text-left space-y-2 bg-navy-light/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-foreground/70">
                  <span className="text-primary">Name:</span> {rsvp.name}
                </p>
                <p className="text-sm text-foreground/70">
                  <span className="text-primary">Plus One:</span>{" "}
                  {rsvp.plusOne ? "Yes" : "No"}
                </p>
                <p className="text-sm text-foreground/70">
                  <span className="text-primary">Meal:</span>{" "}
                  {mealOptions.find((m) => m.value === rsvp.mealChoice)?.label}
                </p>
                <p className="text-sm text-foreground/70">
                  <span className="text-primary">Accommodation:</span>{" "}
                  {rsvp.accommodation ? "Yes" : "No"}
                </p>
              </div>
            )}
            <button onClick={resetForm} className="wedding-button">
              Update Response
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section id="rsvp" className="wedding-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-center max-w-xl mx-auto w-full"
      >
        <h2 className="wedding-subheading mb-4">Will You Join Us?</h2>
        <h3 className="wedding-heading mb-8">RSVP</h3>

        <div className="wedding-divider mx-auto" />

        <form onSubmit={handleSubmit} className="wedding-card mt-12 text-left">
          {/* Name */}
          <div className="mb-6">
            <label className="block text-foreground text-sm font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={rsvp.name}
              onChange={(e) => updateRsvp({ name: e.target.value })}
              className="wedding-input w-full"
              placeholder="Enter your full name"
              required
            />
          </div>

          {/* Attending */}
          <div className="mb-6">
            <label className="block text-foreground text-sm font-medium mb-4">
              Will you be attending?
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateRsvp({ attending: true })}
                className={`flex-1 py-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  rsvp.attending === true
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/30 text-foreground/60 hover:border-primary/50"
                }`}
              >
                <Check className="w-5 h-5" />
                <span>Joyfully Accept</span>
              </button>
              <button
                type="button"
                onClick={() => updateRsvp({ attending: false })}
                className={`flex-1 py-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  rsvp.attending === false
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/30 text-foreground/60 hover:border-primary/50"
                }`}
              >
                <X className="w-5 h-5" />
                <span>Regretfully Decline</span>
              </button>
            </div>
          </div>

          {/* Additional options if attending */}
          {rsvp.attending && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Plus One */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      rsvp.plusOne
                        ? "border-primary bg-primary"
                        : "border-primary/30 group-hover:border-primary/50"
                    }`}
                    onClick={() => updateRsvp({ plusOne: !rsvp.plusOne })}
                  >
                    {rsvp.plusOne && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-foreground">
                    I will be bringing a plus one
                  </span>
                </label>
              </div>

              {/* Meal Choice */}
              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  Meal Preference
                </label>
                <select
                  value={rsvp.mealChoice}
                  onChange={(e) => updateRsvp({ mealChoice: e.target.value })}
                  className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
                  required
                >
                  {mealOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-navy-light"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Accommodation */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      rsvp.accommodation
                        ? "border-primary bg-primary"
                        : "border-primary/30 group-hover:border-primary/50"
                    }`}
                    onClick={() =>
                      updateRsvp({ accommodation: !rsvp.accommodation })
                    }
                  >
                    {rsvp.accommodation && (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                  <span className="text-foreground">
                    I would like to stay at the venue overnight
                  </span>
                </label>
                <p className="text-foreground/50 text-xs mt-2 ml-9">
                  Limited rooms available. We'll confirm availability.
                </p>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={
              rsvp.attending === null ||
              !rsvp.name ||
              (rsvp.attending && !rsvp.mealChoice)
            }
            className="wedding-button w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Submit RSVP
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default RSVPSection;

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

interface Guest {
  name: string;
  mealChoice: string;
}

interface RSVPFormData {
  name: string;
  guests?: Guest[];
  attending: boolean | null;
  plusOne: boolean;
  plusOneName: string;
  plusOneMealChoice: string;
  mealChoice: string;
  accommodation: boolean;
  submitted: boolean;
  isPredefined?: boolean;
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
  const [rsvp, setRsvp] = useState<RSVPFormData>({
    name: "",
    attending: null,
    plusOne: false,
    plusOneName: "",
    plusOneMealChoice: "",
    mealChoice: "",
    accommodation: false,
    submitted: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get name from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const nameFromUrl = urlParams.get("name");

  // Convex query - reactively fetches RSVP by name
  const existingRsvp = useQuery(
    api.rsvps.getByName,
    nameFromUrl ? { name: nameFromUrl } : "skip"
  );

  // Convex mutation
  const submitRsvpMutation = useMutation(api.rsvps.submit);

  // Sync Convex data into local state when it loads
  useEffect(() => {
    if (existingRsvp) {
      setRsvp({
        name: existingRsvp.name,
        guests: existingRsvp.guests,
        attending: existingRsvp.attending,
        plusOne: existingRsvp.plusOne,
        plusOneName: existingRsvp.plusOneName,
        plusOneMealChoice: existingRsvp.plusOneMealChoice,
        mealChoice: existingRsvp.mealChoice,
        accommodation: existingRsvp.accommodation,
        submitted: existingRsvp.submitted,
        isPredefined: existingRsvp.isPredefined,
      });
    } else if (existingRsvp === null && nameFromUrl) {
      // Query returned null - no RSVP found, just set the name
      setRsvp((prev) => ({ ...prev, name: nameFromUrl }));
    }
  }, [existingRsvp, nameFromUrl]);

  // Update local state
  const updateRsvp = (updates: Partial<RSVPFormData>) => {
    setRsvp((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  // Update guest meal choice
  const updateGuestMeal = (guestIndex: number, mealChoice: string) => {
    if (!rsvp.guests) return;
    const updatedGuests = [...rsvp.guests];
    updatedGuests[guestIndex] = { ...updatedGuests[guestIndex], mealChoice };
    updateRsvp({ guests: updatedGuests });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!rsvp.name) {
        setError("Name is required");
        return;
      }
      if (rsvp.attending === null) {
        setError("Please indicate if you will be attending");
        return;
      }

      if (rsvp.attending) {
        if (rsvp.guests && rsvp.guests.length > 0) {
          const missingMeals = rsvp.guests.filter((g) => !g.mealChoice);
          if (missingMeals.length > 0) {
            setError("Meal preferences are required for all guests");
            return;
          }
        } else {
          if (!rsvp.mealChoice) {
            setError("Meal preference is required");
            return;
          }
          if (rsvp.plusOne && !rsvp.plusOneName) {
            setError("Plus one name is required");
            return;
          }
          if (rsvp.plusOne && !rsvp.plusOneMealChoice) {
            setError("Plus one meal preference is required");
            return;
          }
        }
      }

      await submitRsvpMutation({
        name: rsvp.name,
        guests: rsvp.guests,
        attending: rsvp.attending,
        plusOne: rsvp.plusOne,
        plusOneName: rsvp.plusOneName || undefined,
        plusOneMealChoice: rsvp.plusOneMealChoice || undefined,
        mealChoice: rsvp.mealChoice || undefined,
        accommodation: rsvp.accommodation,
        isPredefined: rsvp.isPredefined,
      });

      setRsvp((prev) => ({ ...prev, submitted: true }));
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("RSVP submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    updateRsvp({ submitted: false });
  };

  // Show loading state while Convex query is loading
  if (nameFromUrl && existingRsvp === undefined) {
    return (
      <section id="rsvp" className="wedding-section">
        <div className="text-center max-w-lg mx-auto">
          <div className="wedding-card">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="wedding-text mt-4">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (rsvp.submitted && rsvp.attending !== null) {
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
              {rsvp.attending === true
                ? `We can't wait to celebrate with you${rsvp.plusOne ? " and your guest" : ""}!`
                : "We're sorry you can't make it. You'll be missed!"}
            </p>
            {rsvp.attending && (
              <div className="text-left space-y-2 bg-navy-light/30 rounded-lg p-4 mb-6">
                {rsvp.guests && rsvp.guests.length > 0 ? (
                  <>
                    <p className="text-sm text-foreground/70 mb-3">
                      <span className="text-primary font-medium">Guests:</span>
                    </p>
                    {rsvp.guests.map((guest, index) => (
                      <div key={index} className="ml-4 mb-2 pb-2 border-b border-primary/10 last:border-0">
                        <p className="text-sm text-foreground/70">
                          <span className="text-primary">Name:</span> {guest.name}
                        </p>
                        <p className="text-sm text-foreground/70">
                          <span className="text-primary">Meal:</span>{" "}
                          {mealOptions.find((m) => m.value === guest.mealChoice)?.label}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-sm text-foreground/70">
                      <span className="text-primary">Name:</span> {rsvp.name}
                    </p>
                    <p className="text-sm text-foreground/70">
                      <span className="text-primary">Meal:</span>{" "}
                      {mealOptions.find((m) => m.value === rsvp.mealChoice)?.label}
                    </p>
                    {rsvp.plusOne && (
                      <>
                        <p className="text-sm text-foreground/70">
                          <span className="text-primary">Plus One Name:</span>{" "}
                          {rsvp.plusOneName}
                        </p>
                        <p className="text-sm text-foreground/70">
                          <span className="text-primary">Plus One Meal:</span>{" "}
                          {mealOptions.find((m) => m.value === rsvp.plusOneMealChoice)?.label}
                        </p>
                      </>
                    )}
                  </>
                )}
                <p className="text-sm text-foreground/70 pt-2 border-t border-primary/10">
                  <span className="text-primary">Accommodation:</span>{" "}
                  {rsvp.accommodation ? "Yes" : "No"}
                </p>
              </div>
            )}
            <button
              onClick={resetForm}
              className="wedding-button"
            >
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
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Name - Display differently for couples vs single guests */}
          {rsvp.guests && rsvp.guests.length > 0 ? (
            <div className="mb-6">
              <label className="block text-foreground text-sm font-medium mb-3">
                Guests
              </label>
              <div className="space-y-2">
                {rsvp.guests.map((guest, index) => (
                  <div key={index} className="wedding-input w-full bg-navy-light/50 cursor-default">
                    {guest.name}
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
                disabled={loading}
              />
            </div>
          )}

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
          {rsvp.attending === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {rsvp.guests && rsvp.guests.length > 0 ? (
                <div className="space-y-4">
                  <label className="block text-foreground text-sm font-medium mb-3">
                    Meal Preferences
                  </label>
                  {rsvp.guests.map((guest, index) => (
                    <div key={index} className="space-y-2">
                      <p className="text-foreground/70 text-sm">{guest.name}</p>
                      <select
                        value={guest.mealChoice}
                        onChange={(e) => updateGuestMeal(index, e.target.value)}
                        className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
                        required
                        disabled={loading}
                      >
                        {mealOptions.map((option) => (
                          <option key={option.value} value={option.value} className="bg-navy-light">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {!rsvp.isPredefined && (
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
                  )}

                  {rsvp.plusOne && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 pl-9"
                    >
                      <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                          Plus One Name
                        </label>
                        <input
                          type="text"
                          value={rsvp.plusOneName}
                          onChange={(e) => updateRsvp({ plusOneName: e.target.value })}
                          className="wedding-input w-full"
                          placeholder="Enter their full name"
                          required
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                          Plus One Meal Preference
                        </label>
                        <select
                          value={rsvp.plusOneMealChoice}
                          onChange={(e) => updateRsvp({ plusOneMealChoice: e.target.value })}
                          className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
                          required
                          disabled={loading}
                        >
                          {mealOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-navy-light">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-foreground text-sm font-medium mb-2">
                      Meal Preference
                    </label>
                    <select
                      value={rsvp.mealChoice}
                      onChange={(e) => updateRsvp({ mealChoice: e.target.value })}
                      className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
                      required
                      disabled={loading}
                    >
                      {mealOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-navy-light">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {/* Accommodation */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                      rsvp.accommodation
                        ? "border-primary bg-primary"
                        : "border-primary/30 group-hover:border-primary/50"
                    }`}
                    onClick={() => updateRsvp({ accommodation: !rsvp.accommodation })}
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
              loading ||
              rsvp.attending === null ||
              !rsvp.name ||
              (rsvp.attending === true && rsvp.guests && rsvp.guests.length > 0
                ? rsvp.guests.some((g) => !g.mealChoice)
                : rsvp.attending === true && !rsvp.mealChoice) ||
              (rsvp.plusOne && (!rsvp.plusOneName || !rsvp.plusOneMealChoice))
            }
            className="wedding-button w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </span>
            ) : (
              "Submit RSVP"
            )}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default RSVPSection;

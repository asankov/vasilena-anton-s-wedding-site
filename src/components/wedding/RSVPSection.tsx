import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
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
  numberOfKids: number;
  isPredefined?: boolean;
  askForPlusOne?: boolean;
  askForKids?: boolean;
  maxNumberOfKids?: number;
  askForAccommodation?: boolean;
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
  // Get name from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");

  // Don't render RSVP section if no name parameter
  if (!name) {
    return null;
  }

  return <RSVPForm name={name} />;
};

const RSVPForm = ({ name: nameFromUrl }: { name: string }) => {
  const [rsvp, setRsvp] = useState<RSVPFormData>({
    name: nameFromUrl,
    attending: null,
    plusOne: false,
    plusOneName: "",
    plusOneMealChoice: "",
    mealChoice: "",
    accommodation: false,
    numberOfKids: 0,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Convex query - reactively fetches RSVP by name
  const existingRsvp = useQuery(api.rsvps.getByName, { name: nameFromUrl });

  // Convex mutation
  const submitRsvpMutation = useMutation(api.rsvps.submit);

  // Track whether we've synced server data into local state
  useEffect(() => {
    if (initialLoaded) return;
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
        numberOfKids: existingRsvp.numberOfKids,
        isPredefined: existingRsvp.isPredefined,
        askForPlusOne: existingRsvp.askForPlusOne,
        askForKids: existingRsvp.askForKids,
        maxNumberOfKids: existingRsvp.maxNumberOfKids,
        askForAccommodation: existingRsvp.askForAccommodation,
      });
      setInitialLoaded(true);
    } else if (existingRsvp === null) {
      setInitialLoaded(true);
    }
  }, [existingRsvp, initialLoaded]);

  // Auto-save with debounce
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  const saveToServer = useCallback(
    async (data: RSVPFormData) => {
      if (!data.name) return;
      setSaveStatus("saving");
      try {
        await submitRsvpMutation({
          name: data.name,
          guests: data.guests,
          attending: data.attending,
          plusOne: data.plusOne,
          plusOneName: data.plusOneName || undefined,
          plusOneMealChoice: data.plusOneMealChoice || undefined,
          mealChoice: data.mealChoice || undefined,
          accommodation: data.accommodation,
          numberOfKids: data.numberOfKids,
          isPredefined: data.isPredefined,
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (err) {
        console.error("Auto-save error:", err);
        setSaveStatus("idle");
      }
    },
    [submitRsvpMutation],
  );

  useEffect(() => {
    // Don't save until initial data has loaded
    if (!initialLoaded) return;
    // Don't save on first render after load
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToServer(rsvp);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [rsvp, initialLoaded, saveToServer]);

  // Update local state
  const updateRsvp = (updates: Partial<RSVPFormData>) => {
    setRsvp((prev) => ({ ...prev, ...updates }));
    setSubmitted(false);
  };

  // Update guest meal choice
  const updateGuestMeal = (guestIndex: number, mealChoice: string) => {
    if (!rsvp.guests) return;
    const updatedGuests = [...rsvp.guests];
    updatedGuests[guestIndex] = { ...updatedGuests[guestIndex], mealChoice };
    updateRsvp({ guests: updatedGuests });
  };

  // Show loading state while Convex query is loading
  if (existingRsvp === undefined) {
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

  // Save status indicator
  const SaveIndicator = () => {
    if (saveStatus === "saving") {
      return (
        <span className="flex items-center gap-1 text-xs text-foreground/50">
          <Loader2 className="w-3 h-3 animate-spin" /> Saving...
        </span>
      );
    }
    if (saveStatus === "saved") {
      return (
        <span className="flex items-center gap-1 text-xs text-green-400">
          <Check className="w-3 h-3" /> Saved
        </span>
      );
    }
    return null;
  };

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

        <div className="wedding-card mt-12 text-left">
          {/* Save status */}
          <div className="flex justify-end">
            <SaveIndicator />
          </div>

          {/* Guest names */}
          {rsvp.guests && rsvp.guests.length > 0 && (
            <div className="mb-6">
              <label className="block text-foreground text-sm font-medium mb-3">
                Guests
              </label>
              {rsvp.guests.map((guest, index) => (
                <div
                  key={index}
                  className="wedding-input w-full bg-navy-light/50 cursor-default mb-3"
                >
                  {guest.name}
                </div>
              ))}
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

          {/* Decline message */}
          {rsvp.attending === false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <p className="wedding-text text-foreground/70">
                We're sorry you can't make it. You'll be missed!
              </p>
            </motion.div>
          )}

          {/* Additional options if attending */}
          {rsvp.attending === true && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >

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
                  ))}
                </div>

                  {!rsvp.isPredefined && rsvp.askForPlusOne !== false && (
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
                          onChange={(e) =>
                            updateRsvp({ plusOneName: e.target.value })
                          }
                          className="wedding-input w-full"
                          placeholder="Enter their full name"
                        />
                      </div>
                      <div>
                        <label className="block text-foreground text-sm font-medium mb-2">
                          Plus One Meal Preference
                        </label>
                        <select
                          value={rsvp.plusOneMealChoice}
                          onChange={(e) =>
                            updateRsvp({ plusOneMealChoice: e.target.value })
                          }
                          className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
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
                    </motion.div>
                  )}

              {/* Kids */}
              {rsvp.askForKids && rsvp.maxNumberOfKids && rsvp.maxNumberOfKids > 0 && (
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    How many kids will you bring?
                  </label>
                  <select
                    value={rsvp.numberOfKids}
                    onChange={(e) =>
                      updateRsvp({ numberOfKids: parseInt(e.target.value) })
                    }
                    className="wedding-input w-full appearance-none cursor-pointer bg-navy-light"
                  >
                    {Array.from({ length: rsvp.maxNumberOfKids + 1 }, (_, i) => (
                      <option key={i} value={i} className="bg-navy-light">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Accommodation */}
              {rsvp.askForAccommodation !== false && (
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
              )}
            </motion.div>
          )}

          {/* Submit button */}
          <button
            type="button"
            disabled={submitted}
            onClick={() => setSubmitted(true)}
            className="wedding-button w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitted ? "Submitted" : "Submit RSVP"}
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default RSVPSection;

import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import MealChoiceDialog from "./MealChoiceDialog";

interface Guest {
  name: string;
  mealChoice: string;
  allergies?: string;
}

interface RSVPFormData {
  name: string;
  guests: Guest[];
  attending: boolean | null;
  mealChoice: string;
  accommodation: boolean;
  numberOfKids: number;
  askForPlusOne?: boolean;
  askForKids?: boolean;
  maxNumberOfKids?: number;
  askForAccommodation?: boolean;
  originalGuestCount?: number;
}

const RSVPSection = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const name = urlParams.get("name");
  if (!name) return null;
  return <RSVPForm name={name} />;
};

const RSVPForm = ({ name: nameFromUrl }: { name: string }) => {
  const [rsvp, setRsvp] = useState<RSVPFormData>({
    name: nameFromUrl,
    guests: [],
    attending: null,
    mealChoice: "",
    accommodation: false,
    numberOfKids: 0,
  });
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [initialLoaded, setInitialLoaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [originalGuestCount, setOriginalGuestCount] = useState<number | null>(null);

  const existingRsvp = useQuery(api.rsvps.getByName, { name: nameFromUrl });
  const submitRsvpMutation = useMutation(api.rsvps.submit);

  useEffect(() => {
    if (initialLoaded) return;
    if (existingRsvp) {
      const guests = existingRsvp.guests ?? [];
      const origCount = existingRsvp.originalGuestCount ?? guests.length;
      setOriginalGuestCount(origCount);
      setRsvp({
        name: existingRsvp.name,
        guests,
        attending: existingRsvp.attending,
        mealChoice: existingRsvp.mealChoice,
        accommodation: existingRsvp.accommodation,
        numberOfKids: existingRsvp.numberOfKids === 0 ? (existingRsvp.maxNumberOfKids ?? 0) : existingRsvp.numberOfKids,
        askForPlusOne: existingRsvp.askForPlusOne,
        askForKids: existingRsvp.askForKids,
        maxNumberOfKids: existingRsvp.maxNumberOfKids,
        askForAccommodation: existingRsvp.askForAccommodation,
        originalGuestCount: origCount,
      });
      setInitialLoaded(true);
    } else if (existingRsvp === null) {
      setInitialLoaded(true);
    }
  }, [existingRsvp, initialLoaded]);

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
          mealChoice: data.mealChoice || undefined,
          accommodation: data.accommodation,
          numberOfKids: data.numberOfKids ?? 0,
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
    if (!initialLoaded) return;
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveToServer(rsvp), 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [rsvp, initialLoaded, saveToServer]);

  const updateRsvp = (updates: Partial<RSVPFormData>) => {
    setRsvp((prev) => ({ ...prev, ...updates }));
    setSubmitted(false);
  };

  const updateGuestField = (index: number, field: keyof Guest, value: string) => {
    const updated = [...rsvp.guests];
    updated[index] = { ...updated[index], [field]: value };
    updateRsvp({ guests: updated });
  };

  // The plus one is the last guest if guests.length > originalGuestCount
  const origCount = originalGuestCount ?? rsvp.guests.length;
  const hasPlusOne = rsvp.guests.length > origCount;

  const addPlusOne = () => {
    updateRsvp({ guests: [...rsvp.guests, { name: "", mealChoice: "", allergies: "" }] });
  };

  const removePlusOne = () => {
    updateRsvp({ guests: rsvp.guests.slice(0, origCount) });
  };

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
        <h2 className="wedding-subheading mb-4">{rsvp.guests.length == 1 ? "Ще бъдеш ли с нас?" : "Ще бъдете ли с нас?"}</h2>
        <h3 className="wedding-heading mb-8">RSVP</h3>

        <div className="wedding-divider mx-auto" />

        <div className="wedding-card mt-12 text-left">
          <div className="flex justify-end">
            <SaveIndicator />
          </div>

          {/* Guest names (original, read-only) */}
          {rsvp.guests.slice(0, origCount).length > 0 && (
            <div className="mb-6">
              <label className="block text-foreground text-sm font-medium mb-3">
                Име
              </label>
              {rsvp.guests.slice(0, origCount).map((guest, index) => (
                <div key={index} className="mb-3">
                  <div className="wedding-input w-full bg-navy-light/50 cursor-default">
                    {guest.name}
                  </div>
                  {rsvp.askForPlusOne === true && index === origCount - 1 && (
                    hasPlusOne ? (
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={rsvp.guests[origCount]?.name ?? ""}
                            onChange={(e) => updateGuestField(origCount, "name", e.target.value)}
                            className="wedding-input w-full"
                            placeholder="Plus one's full name"
                          />
                          <button
                            type="button"
                            onClick={removePlusOne}
                            className="text-foreground/40 hover:text-red-400 transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={addPlusOne}
                        className="w-full mt-1 py-2 rounded-lg border border-dashed border-primary/30 text-foreground/40 hover:border-primary/60 hover:text-foreground/60 transition-all text-sm flex items-center justify-center gap-2"
                      >
                        + Add plus one
                      </button>
                    )
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Attending */}
          <div className="mb-6">
            <label className="block text-foreground text-sm font-medium mb-4">
              {rsvp.guests.length == 1 ? "Ще бъдеш ли с нас?" : "Ще бъдете ли с нас?"}
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => updateRsvp({ attending: true })}
                className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  rsvp.attending === true
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/30 text-foreground/60 hover:border-primary/50"
                }`}
              >
                <Check className="w-5 h-5 shrink-0" />
                <span>{ rsvp.guests.length == 1 ? "Приемам" : "Приемаме" }</span>
              </button>
              <button
                type="button"
                onClick={() => updateRsvp({ attending: false })}
                className={`flex-1 py-4 px-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                  rsvp.attending === false
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/30 text-foreground/60 hover:border-primary/50"
                }`}
              >
                <X className="w-5 h-5 shrink-0" />
                <span>{ rsvp.guests.length == 1 ? "Няма да мога" : "Няма да можем" }</span>
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
                { rsvp.guests.length == 1 ? "Съжаляваме, че няма да може да дойдеш!" : "Съжаляваме, че няма да може да дойдете!" }
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
              {/* Meal preferences for all guests */}
              <div className="space-y-4">
                <label className="block text-foreground text-sm font-medium mb-3">
                  Избор на меню
                </label>
                {rsvp.guests.map((guest, index) => (
                  <div key={index} className="space-y-2">
                    <p className="text-foreground/70 text-sm">{guest.name || "Plus One"}</p>
                    <MealChoiceDialog
                      guestName={guest.name || "Plus One"}
                      value={guest.mealChoice}
                      onChange={(value) => updateGuestField(index, "mealChoice", value)}
                    />
                    <input
                      type="text"
                      value={guest.allergies ?? ""}
                      onChange={(e) => updateGuestField(index, "allergies", e.target.value)}
                      className="wedding-input w-full text-sm"
                      placeholder="Алергии или други предпочитания"
                    />
                  </div>
                ))}
              </div>

              {/* Kids */}
              {rsvp.askForKids && rsvp.maxNumberOfKids && rsvp.maxNumberOfKids > 0 && (
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Колко деца ще доведете?
                  </label>
                  <div className="flex gap-2">
                    {Array.from({ length: rsvp.maxNumberOfKids + 1 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => updateRsvp({ numberOfKids: i })}
                        className={`flex-1 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          rsvp.numberOfKids === i
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-primary/30 text-foreground/60 hover:border-primary/50"
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Accommodation */}
              {rsvp.askForAccommodation === true && (
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
                      Искаме да останем с преспиване
                    </span>
                  </label>
                  {/*<p className="text-foreground/50 text-xs mt-2 ml-9">
                    Limited rooms available. We'll confirm availability.
                  </p>*/}
                </div>
              )}
            </motion.div>
          )}

          <button
            type="button"
            disabled={submitted}
            onClick={() => setSubmitted(true)}
            className="wedding-button w-full mt-8 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {submitted ? "Запазено" : "Запази"}
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default RSVPSection;

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader2, Users, Check, X, UtensilsCrossed, Hotel, Plus, Trash2, UserPlus, Copy } from "lucide-react";
import { Link } from "react-router-dom";

const mealLabels: Record<string, string> = {
  beef: "Beef Tenderloin",
  chicken: "Herb-Roasted Chicken",
  fish: "Pan-Seared Salmon",
  vegetarian: "Vegetarian Risotto",
  vegan: "Vegan Buddha Bowl",
};

const Admin = () => {
  const rsvps = useQuery(api.rsvps.getAll);
  const createInvite = useMutation(api.rsvps.createInvite);

  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [guestNames, setGuestNames] = useState<string[]>([]);
  const [newGuestName, setNewGuestName] = useState("");
  const [askForPlusOne, setAskForPlusOne] = useState(true);
  const [askForAccommodation, setAskForAccommodation] = useState(true);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addGuestName = () => {
    const trimmed = newGuestName.trim();
    if (trimmed && !guestNames.includes(trimmed)) {
      setGuestNames([...guestNames, trimmed]);
      setNewGuestName("");
    }
  };

  const removeGuestName = (index: number) => {
    setGuestNames(guestNames.filter((_, i) => i !== index));
  };

  const handleCreateInvite = async () => {
    const name = inviteName.trim();
    if (!name) {
      setInviteError("Invite name is required");
      return;
    }
    setInviteLoading(true);
    setInviteError(null);
    try {
      await createInvite({
        name,
        guests: guestNames.length > 0 ? guestNames : undefined,
        askForPlusOne,
        askForAccommodation,
      });
      setInviteName("");
      setGuestNames([]);
      setNewGuestName("");
      setAskForPlusOne(true);
      setAskForAccommodation(true);
      setShowInviteForm(false);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setInviteLoading(false);
    }
  };

  const getInviteLink = (name: string) => {
    const base = window.location.origin + import.meta.env.BASE_URL.replace(/\/$/, "");
    return `${base}/?name=${encodeURIComponent(name)}`;
  };

  const copyLink = (name: string, id: string) => {
    navigator.clipboard.writeText(getInviteLink(name));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (rsvps === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const attending = rsvps.filter((r) => r.attending === true);
  const declined = rsvps.filter((r) => r.attending === false);
  const pending = rsvps.filter((r) => r.attending === null);
  const needAccommodation = rsvps.filter((r) => r.accommodation);

  // Count total guests (including plus ones and guest lists)
  const totalGuests = attending.reduce((count, r) => {
    if (r.guests && r.guests.length > 0) {
      return count + r.guests.length;
    }
    return count + 1 + (r.plusOne ? 1 : 0);
  }, 0);

  // Aggregate meal choices
  const mealCounts: Record<string, number> = {};
  attending.forEach((r) => {
    if (r.guests && r.guests.length > 0) {
      r.guests.forEach((g) => {
        if (g.mealChoice) {
          mealCounts[g.mealChoice] = (mealCounts[g.mealChoice] || 0) + 1;
        }
      });
    } else {
      if (r.mealChoice) {
        mealCounts[r.mealChoice] = (mealCounts[r.mealChoice] || 0) + 1;
      }
      if (r.plusOne && r.plusOneMealChoice) {
        mealCounts[r.plusOneMealChoice] = (mealCounts[r.plusOneMealChoice] || 0) + 1;
      }
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-primary/20 bg-navy-light/30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-primary">RSVP Admin</h1>
          <Link to="/" className="text-sm text-foreground/60 hover:text-primary transition-colors">
            Back to site
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="wedding-card text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-primary">{totalGuests}</p>
            <p className="text-sm text-foreground/60">Total Guests</p>
          </div>
          <div className="wedding-card text-center">
            <Check className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-green-400">{attending.length}</p>
            <p className="text-sm text-foreground/60">Attending</p>
          </div>
          <div className="wedding-card text-center">
            <X className="w-6 h-6 text-red-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-red-400">{declined.length}</p>
            <p className="text-sm text-foreground/60">Declined</p>
          </div>
          <div className="wedding-card text-center">
            <Hotel className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-400">{needAccommodation.length}</p>
            <p className="text-sm text-foreground/60">Need Accommodation</p>
          </div>
        </div>

        {/* Create Invite */}
        <div className="wedding-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-serif text-primary">Guest Invites</h2>
            </div>
            {!showInviteForm && (
              <button
                onClick={() => setShowInviteForm(true)}
                className="wedding-button text-sm px-4 py-2 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create Invite
              </button>
            )}
          </div>

          {showInviteForm && (
            <div className="bg-navy-light/30 rounded-lg p-4 space-y-4">
              {inviteError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">{inviteError}</p>
                </div>
              )}

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  Invite Name
                </label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  className="wedding-input w-full"
                  placeholder="e.g. The Smiths, or John Doe"
                />
                <p className="text-foreground/50 text-xs mt-1">
                  This is the lookup key used in the invite link (?name=...)
                </p>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-2">
                  Guest Names (optional, for couples/groups)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGuestName())}
                    className="wedding-input flex-1"
                    placeholder="Add a guest name"
                  />
                  <button
                    type="button"
                    onClick={addGuestName}
                    className="px-3 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {guestNames.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {guestNames.map((name, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-primary/20 text-primary text-sm px-3 py-1 rounded-full"
                      >
                        {name}
                        <button onClick={() => removeGuestName(i)} className="hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-foreground/50 text-xs mt-1">
                  Leave empty for single guests. Add names for couples/groups — they'll see pre-filled names and choose meals individually.
                </p>
              </div>

              <div>
                <label className="block text-foreground text-sm font-medium mb-3">
                  RSVP Template
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={askForPlusOne}
                      onChange={(e) => setAskForPlusOne(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-foreground text-sm">Ask for plus one</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={askForAccommodation}
                      onChange={(e) => setAskForAccommodation(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-foreground text-sm">Ask for accommodation</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteName("");
                    setGuestNames([]);
                    setNewGuestName("");
                    setAskForPlusOne(true);
                    setAskForAccommodation(true);
                    setInviteError(null);
                  }}
                  className="px-4 py-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateInvite}
                  disabled={inviteLoading || !inviteName.trim()}
                  className="wedding-button text-sm px-4 py-2 disabled:opacity-50"
                >
                  {inviteLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                    </span>
                  ) : (
                    "Create Invite"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Meal Breakdown */}
        {Object.keys(mealCounts).length > 0 && (
          <div className="wedding-card">
            <div className="flex items-center gap-2 mb-4">
              <UtensilsCrossed className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-serif text-primary">Meal Breakdown</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(mealCounts).map(([meal, count]) => (
                <div key={meal} className="bg-navy-light/30 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-foreground">{count}</p>
                  <p className="text-xs text-foreground/60">{mealLabels[meal] || meal}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending RSVPs */}
        {pending.length > 0 && (
          <div className="wedding-card">
            <h2 className="text-lg font-serif text-yellow-400 mb-4">
              Pending ({pending.length})
            </h2>
            <div className="space-y-2">
              {pending.map((r) => (
                <div key={r._id} className="bg-navy-light/30 rounded-lg p-3 flex items-center justify-between">
                  <span className="text-foreground">{r.name}</span>
                  <span className="text-xs text-yellow-400/70">No response yet</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All RSVPs Table */}
        <div className="wedding-card overflow-x-auto">
          <h2 className="text-lg font-serif text-primary mb-4">All Responses ({rsvps.length})</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary/20 text-left">
                <th className="pb-3 text-foreground/60 font-medium">Name</th>
                <th className="pb-3 text-foreground/60 font-medium">Status</th>
                <th className="pb-3 text-foreground/60 font-medium hidden md:table-cell">Guests</th>
                <th className="pb-3 text-foreground/60 font-medium hidden md:table-cell">Meals</th>
                <th className="pb-3 text-foreground/60 font-medium hidden md:table-cell">Accommodation</th>
                <th className="pb-3 text-foreground/60 font-medium">Link</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r._id} className="border-b border-primary/10">
                  <td className="py-3 text-foreground">
                    {r.name}
                    {r.isPredefined && (
                      <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                        Pre-defined
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    {r.attending === true && (
                      <span className="text-green-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> Attending
                      </span>
                    )}
                    {r.attending === false && (
                      <span className="text-red-400 flex items-center gap-1">
                        <X className="w-4 h-4" /> Declined
                      </span>
                    )}
                    {r.attending === null && (
                      <span className="text-yellow-400">Pending</span>
                    )}
                  </td>
                  <td className="py-3 text-foreground/70 hidden md:table-cell">
                    {r.guests && r.guests.length > 0 ? (
                      <span>{r.guests.map((g) => g.name).join(", ")}</span>
                    ) : (
                      <span>
                        {r.name}
                        {r.plusOne && r.plusOneName ? `, ${r.plusOneName}` : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-foreground/70 hidden md:table-cell">
                    {r.guests && r.guests.length > 0 ? (
                      <span>
                        {r.guests
                          .map((g) => mealLabels[g.mealChoice] || g.mealChoice || "—")
                          .join(", ")}
                      </span>
                    ) : (
                      <span>
                        {mealLabels[r.mealChoice] || r.mealChoice || "—"}
                        {r.plusOne && r.plusOneMealChoice
                          ? `, ${mealLabels[r.plusOneMealChoice] || r.plusOneMealChoice}`
                          : ""}
                      </span>
                    )}
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    {r.accommodation ? (
                      <span className="text-blue-400">Yes</span>
                    ) : (
                      <span className="text-foreground/40">No</span>
                    )}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => copyLink(r.name, r._id)}
                      className="text-xs flex items-center gap-1 text-foreground/50 hover:text-primary transition-colors"
                      title={getInviteLink(r.name)}
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === r._id ? "Copied!" : "Copy"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;

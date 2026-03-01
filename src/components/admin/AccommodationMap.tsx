import React, { useState } from "react";
import { Home, GripVertical, X } from "lucide-react";

export interface AccommodationGuest {
  id: string;
  name: string;
  guestNames: string[];
}

interface Villa {
  id: number;
  name: string;
  people: number;
}

const villas: Villa[] = [
  { id: 1, name: "Cuba", people: 2 },
  { id: 2, name: "Bulgaria", people: 2 },
  { id: 3, name: "Mexico", people: 2 },
  { id: 4, name: "Sicily", people: 2 },
  { id: 5, name: "Oslo", people: 2 },
  { id: 6, name: "Art", people: 2 },
  { id: 7, name: "Alps", people: 2 },
  { id: 8, name: "Rustic", people: 2 },
  { id: 9, name: "Bohemian", people: 2 },
  { id: 10, name: "Shabby Chic", people: 2 },
  { id: 11, name: "Arabian Night", people: 2 },
  { id: 12, name: "Morocco", people: 2 },
  { id: 13, name: "Mykonos", people: 2 },
  { id: 14, name: "Africa", people: 2 },
  { id: 15, name: "Costa Rica", people: 2 },
];

// Assignments: villaId -> array of guest names in each slot
type Assignments = Record<number, (string | null)[]>;

function initAssignments(): Assignments {
  const a: Assignments = {};
  for (const v of villas) {
    a[v.id] = Array(v.people).fill(null);
  }
  return a;
}

const GuestChip = ({
  name,
  onDragStart,
  onRemove,
}: {
  name: string;
  onDragStart: (e: React.DragEvent) => void;
  onRemove?: () => void;
}) => (
  <div
    draggable
    onDragStart={onDragStart}
    className="flex items-center gap-1.5 bg-primary/20 text-primary text-xs px-2.5 py-1.5 rounded-full cursor-grab active:cursor-grabbing select-none"
  >
    <GripVertical className="w-3 h-3 text-primary/50" />
    <span className="truncate max-w-[120px]">{name}</span>
    {onRemove && (
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="hover:text-red-400 transition-colors ml-0.5"
      >
        <X className="w-3 h-3" />
      </button>
    )}
  </div>
);

const VillaSlot = ({
  assignedGuest,
  villaId,
  slotIndex,
  onDrop,
  onRemove,
  dragOver,
  onDragOver,
  onDragLeave,
}: {
  assignedGuest: string | null;
  villaId: number;
  slotIndex: number;
  onDrop: (villaId: number, slotIndex: number) => void;
  onRemove: (villaId: number, slotIndex: number) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) => (
  <div
    onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
    onDragLeave={onDragLeave}
    onDrop={(e) => { e.preventDefault(); onDrop(villaId, slotIndex); }}
    className={`
      w-5 h-5 sm:w-6 sm:h-6 rounded border transition-all relative group
      ${assignedGuest
        ? "border-primary/60 bg-primary/30"
        : dragOver
          ? "border-primary bg-primary/20 scale-110"
          : "border-foreground/30 bg-foreground/5"
      }
    `}
    title={assignedGuest || "Empty slot"}
  >
    {assignedGuest && (
      <button
        onClick={() => onRemove(villaId, slotIndex)}
        className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full items-center justify-center text-white hidden group-hover:flex"
      >
        <X className="w-2 h-2" />
      </button>
    )}
  </div>
);

const VillaCard = ({
  villa,
  assignments,
  onDrop,
  onRemove,
  dragOverSlot,
  onSlotDragOver,
  onSlotDragLeave,
}: {
  villa: Villa;
  assignments: (string | null)[];
  onDrop: (villaId: number, slotIndex: number) => void;
  onRemove: (villaId: number, slotIndex: number) => void;
  dragOverSlot: { villaId: number; slotIndex: number } | null;
  onSlotDragOver: (villaId: number, slotIndex: number, e: React.DragEvent) => void;
  onSlotDragLeave: () => void;
}) => {
  const filledCount = assignments.filter(Boolean).length;
  const isFull = filledCount === villa.people;

  return (
    <div
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
        min-w-[80px] sm:min-w-[100px]
        ${isFull
          ? "border-green-500/50 bg-green-500/10"
          : filledCount > 0
            ? "border-yellow-500/40 bg-yellow-500/5"
            : "border-primary/30 bg-navy-light/50"
        }
      `}
    >
      <span className="text-orange-400 font-bold text-sm">{villa.id}</span>
      <Home className={`w-5 h-5 sm:w-6 sm:h-6 ${isFull ? "text-green-400" : "text-foreground/70"}`} />
      <span className="text-[10px] sm:text-xs text-foreground/80 font-medium uppercase tracking-wide text-center leading-tight">
        {villa.name}
      </span>
      <div className="flex gap-1 mt-1">
        {assignments.map((guest, i) => (
          <VillaSlot
            key={i}
            assignedGuest={guest}
            villaId={villa.id}
            slotIndex={i}
            onDrop={onDrop}
            onRemove={onRemove}
            dragOver={dragOverSlot?.villaId === villa.id && dragOverSlot?.slotIndex === i}
            onDragOver={(e) => onSlotDragOver(villa.id, i, e)}
            onDragLeave={onSlotDragLeave}
          />
        ))}
      </div>
      {/* Show assigned names tooltip area */}
      {filledCount > 0 && (
        <div className="text-[9px] text-foreground/50 text-center leading-tight mt-0.5">
          {assignments.filter(Boolean).join(", ")}
        </div>
      )}
    </div>
  );
};

const AccommodationMap = ({ guests }: { guests: AccommodationGuest[] }) => {
  const [assignments, setAssignments] = useState<Assignments>(initAssignments);
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ villaId: number; slotIndex: number } | null>(null);

  // Collect all individual guest names that need accommodation
  const allGuestNames = guests.flatMap((g) =>
    g.guestNames.length > 0 ? g.guestNames : [g.name]
  );

  // Find which guests are already assigned
  const assignedNames = new Set(
    Object.values(assignments).flat().filter(Boolean) as string[]
  );
  const unassignedGuests = allGuestNames.filter((n) => !assignedNames.has(n));

  const handleDragStart = (e: React.DragEvent, guestName: string) => {
    e.dataTransfer.setData("text/plain", guestName);
    setDraggedGuest(guestName);
  };

  const handleDrop = (villaId: number, slotIndex: number) => {
    if (!draggedGuest) return;

    setAssignments((prev) => {
      const next = { ...prev };

      // Remove from previous slot if reassigning
      for (const vid of Object.keys(next)) {
        const id = Number(vid);
        const idx = next[id].indexOf(draggedGuest);
        if (idx !== -1) {
          next[id] = [...next[id]];
          next[id][idx] = null;
        }
      }

      // If target slot is already occupied, don't overwrite
      if (next[villaId][slotIndex] !== null) return prev;

      next[villaId] = [...next[villaId]];
      next[villaId][slotIndex] = draggedGuest;
      return next;
    });

    setDraggedGuest(null);
    setDragOverSlot(null);
  };

  const handleRemove = (villaId: number, slotIndex: number) => {
    setAssignments((prev) => {
      const next = { ...prev };
      next[villaId] = [...next[villaId]];
      next[villaId][slotIndex] = null;
      return next;
    });
  };

  const handleSlotDragOver = (villaId: number, slotIndex: number, _e: React.DragEvent) => {
    setDragOverSlot({ villaId, slotIndex });
  };

  const handleSlotDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedGuest(null);
    setDragOverSlot(null);
  };

  const renderVilla = (villaIndex: number) => {
    const villa = villas[villaIndex];
    return (
      <VillaCard
        key={villa.id}
        villa={villa}
        assignments={assignments[villa.id]}
        onDrop={handleDrop}
        onRemove={handleRemove}
        dragOverSlot={dragOverSlot}
        onSlotDragOver={handleSlotDragOver}
        onSlotDragLeave={handleSlotDragLeave}
      />
    );
  };

  return (
    <div className="flex gap-6" onDragEnd={handleDragEnd}>
      {/* Sidebar: guest list */}
      <div className="w-56 shrink-0">
        <div className="wedding-card sticky top-4">
          <h2 className="text-sm font-serif text-primary mb-3">
            Guests ({unassignedGuests.length}/{allGuestNames.length})
          </h2>
          {unassignedGuests.length === 0 && allGuestNames.length > 0 && (
            <p className="text-xs text-green-400">All guests assigned!</p>
          )}
          {allGuestNames.length === 0 && (
            <p className="text-xs text-foreground/50">No guests need accommodation</p>
          )}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
            {unassignedGuests.map((name) => (
              <GuestChip
                key={name}
                name={name}
                onDragStart={(e) => handleDragStart(e, name)}
              />
            ))}
          </div>
          {assignedNames.size > 0 && (
            <>
              <div className="border-t border-primary/20 my-3" />
              <h3 className="text-xs text-foreground/50 mb-2">Assigned ({assignedNames.size})</h3>
              <div className="space-y-1.5 max-h-[30vh] overflow-y-auto">
                {Array.from(assignedNames).map((name) => (
                  <GuestChip
                    key={name}
                    name={name}
                    onDragStart={(e) => handleDragStart(e, name)}
                    onRemove={() => {
                      // Find and remove from assignments
                      setAssignments((prev) => {
                        const next = { ...prev };
                        for (const vid of Object.keys(next)) {
                          const id = Number(vid);
                          const idx = next[id].indexOf(name);
                          if (idx !== -1) {
                            next[id] = [...next[id]];
                            next[id][idx] = null;
                          }
                        }
                        return next;
                      });
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Map */}
      <div className="flex-1 space-y-6">
        <div className="wedding-card">
          <h2 className="text-lg font-serif text-primary mb-6">Villa Map — Wild Hill</h2>
          <div className="relative bg-navy-light/20 rounded-xl p-4 sm:p-6 overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Row 1: Art (top center) */}
              <div className="flex justify-center mb-3">
                {renderVilla(5)}
              </div>

              {/* Row 2: Oslo + Alps */}
              <div className="flex justify-center gap-24 sm:gap-32 mb-3">
                {renderVilla(4)}
                {renderVilla(6)}
              </div>

              {/* Row 3: Sicily + Bohemian + Rustic */}
              <div className="flex justify-center gap-12 sm:gap-20 mb-3">
                {renderVilla(3)}
                {renderVilla(8)}
                {renderVilla(7)}
              </div>

              {/* Row 4: Bulgaria + Mexico + Shabby Chic + Arabian Night + Morocco */}
              <div className="flex items-end gap-2 sm:gap-3 mb-3">
                {renderVilla(1)}
                {renderVilla(2)}
                <div className="flex-1" />
                {renderVilla(9)}
                {renderVilla(10)}
                {renderVilla(11)}
              </div>

              {/* Row 5: Cuba + Mykonos area */}
              <div className="flex items-end gap-2 sm:gap-3 mb-3">
                {renderVilla(0)}
                <div className="flex-1" />
                {renderVilla(12)}
                <div className="flex-1" />
                {renderVilla(13)}
                {renderVilla(14)}
              </div>

              {/* Bottom: Garden + Hall */}
              <div className="mt-4 space-y-2">
                <div className="bg-green-800/30 border border-green-600/40 rounded-lg p-3 text-center max-w-md">
                  <span className="text-green-400 font-serif text-sm tracking-wider">GARDEN</span>
                </div>
                <div className="bg-yellow-800/20 border border-yellow-600/30 rounded-lg p-3 text-center max-w-md">
                  <span className="text-yellow-400/80 font-serif text-sm tracking-wider">WILD HILL Hall</span>
                </div>
                <div className="text-center max-w-md">
                  <span className="text-foreground/40 text-xs">entrance</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Villa Legend */}
        <div className="wedding-card">
          <h2 className="text-lg font-serif text-primary mb-4">Villas</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {villas.map((villa) => {
              const filled = assignments[villa.id].filter(Boolean).length;
              return (
                <div
                  key={villa.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg text-left
                    ${filled === villa.people
                      ? "bg-green-500/10 border border-green-500/30"
                      : filled > 0
                        ? "bg-yellow-500/5 border border-yellow-500/20"
                        : "bg-navy-light/30 border border-transparent"
                    }
                  `}
                >
                  <span className="text-orange-400 font-bold text-sm w-5 text-right">{villa.id}.</span>
                  <span className="text-foreground/80 text-sm flex-1">{villa.name}</span>
                  <span className="text-[10px] text-foreground/40">{filled}/{villa.people}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationMap;

import React, { useState } from "react";
import { Home, GripVertical, X } from "lucide-react";

export interface AccommodationGuest {
  id: string;
  name: string;
  guestNames: string[];
}

// A bed occupies 1 slot (single) or 2 slots (double/shared)
interface Bed {
  size: 1 | 2;
}

interface Villa {
  id: number;
  name: string;
  people: number;
  rooms: Bed[][]; // array of rooms, each room is array of beds
  bridal?: boolean;
}

// Helper: total slots in a villa
function totalSlots(villa: Villa) {
  return villa.rooms.flat().reduce((s, b) => s + b.size, 0);
}

// Helper: slot index ranges per bed within the villa (flattened)
function buildBedSlotMap(villa: Villa): { bed: Bed; startSlot: number }[] {
  const result: { bed: Bed; startSlot: number }[] = [];
  let slot = 0;
  for (const room of villa.rooms) {
    for (const bed of room) {
      result.push({ bed, startSlot: slot });
      slot += bed.size;
    }
  }
  return result;
}

// S = single bed, D = double bed
const S: Bed = { size: 1 };
const D: Bed = { size: 2 };

const villas: Villa[] = [
  // 1 double bed + 1 single bed = 3 people, 1 room
  { id: 1,  name: "Cuba",          people: 3,  rooms: [[D, S]] },
  { id: 2,  name: "Bulgaria",      people: 3,  rooms: [[D, S]] },
  { id: 3,  name: "Mexico",        people: 3,  rooms: [[D, S]] },
  { id: 4,  name: "Shabby Chic",   people: 3,  rooms: [[D, S]] },
  { id: 5,  name: "Sicily",        people: 3,  rooms: [[D, S]] },
  { id: 6,  name: "Bohemian",      people: 3,  rooms: [[D, S]] },
  { id: 7,  name: "Oslo",          people: 3,  rooms: [[D, S]] },
  { id: 8,  name: "Alps",          people: 3,  rooms: [[D, S]] },
  { id: 14, name: "Rustic",        people: 3,  rooms: [[D, S]] },
  { id: 9,  name: "Mykonos",       people: 2,  rooms: [[D]], bridal: true },
  { id: 10, name: "Africa",        people: 4,  rooms: [[D, S, S]] },
  { id: 11, name: "Costa Rica",    people: 4,  rooms: [[D, S, S]] },
  { id: 12, name: "Arabian Night", people: 4,  rooms: [[D, S, S]] },
  { id: 13, name: "Morocco",       people: 4,  rooms: [[D, S, S]] },
  { id: 15, name: "Art",           people: 13, rooms: [[S, S, S, S], [S, S], [S, S], [S, S], [S, S, S]] },
];

// Assignments: villaId -> array of guest names in each slot
type Assignments = Record<number, (string | null)[]>;

function initAssignments(): Assignments {
  const a: Assignments = {};
  for (const v of villas) {
    a[v.id] = Array(totalSlots(v)).fill(null);
  }
  // Pre-fill bridal suite with the couple's names
  a[9] = ["Vasilena", "Anton"];
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
  isDouble,
  isFirstOfDouble,
  isLastOfDouble,
  isBridal,
  onDrop,
  onRemove,
  dragOver,
  onDragOver,
  onDragLeave,
}: {
  assignedGuest: string | null;
  villaId: number;
  slotIndex: number;
  isDouble: boolean;
  isFirstOfDouble: boolean;
  isLastOfDouble: boolean;
  isBridal: boolean;
  onDrop: (villaId: number, slotIndex: number) => void;
  onRemove: (villaId: number, slotIndex: number) => void;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
}) => {
  const filled = assignedGuest !== null;
  const doubleBase = isDouble && !isBridal
    ? filled
      ? "bg-rose-400/30 border-rose-400/60"
      : dragOver
        ? "bg-rose-400/20 border-rose-400 scale-110"
        : "bg-rose-900/20 border-rose-400/30"
    : isBridal
      ? filled
        ? "bg-white/30 border-white/60"
        : dragOver
          ? "bg-white/20 border-white scale-110"
          : "bg-white/5 border-white/30"
      : filled
        ? "bg-primary/30 border-primary/60"
        : dragOver
          ? "bg-primary/20 border-primary scale-110"
          : "bg-foreground/5 border-foreground/30";

  // For double beds: first half has no right border, second has no left border
  // giving a unified look with a single internal divider line
  const borderClass = isDouble
    ? isFirstOfDouble
      ? "border-t border-b border-l border-r-0"
      : "border-t border-b border-r border-l-0"
    : "border";

  const roundingClass = isDouble
    ? isFirstOfDouble
      ? "rounded-l rounded-r-none"
      : "rounded-r rounded-l-none"
    : "rounded";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(villaId, slotIndex); }}
      className={`w-5 h-5 sm:w-6 sm:h-6 transition-all relative group ${doubleBase} ${borderClass} ${roundingClass}`}
      title={assignedGuest ? `${assignedGuest}${isDouble ? " (shared bed)" : ""}` : isDouble ? "Shared bed (empty)" : "Single bed (empty)"}
    >
      {filled && (
        <button
          onClick={() => onRemove(villaId, slotIndex)}
          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full items-center justify-center text-white hidden group-hover:flex z-10"
        >
          <X className="w-2 h-2" />
        </button>
      )}
      {/* Single divider line from the first half */}
      {isDouble && isFirstOfDouble && (
        <div className={`absolute right-0 top-1 bottom-1 w-px ${isBridal ? "bg-white/40" : "bg-rose-400/40"}`} />
      )}
    </div>
  );
};

const BedSlots = ({
  bed,
  startSlot,
  assignments,
  villaId,
  isBridal,
  onDrop,
  onRemove,
  dragOverSlot,
  onSlotDragOver,
  onSlotDragLeave,
}: {
  bed: Bed;
  startSlot: number;
  assignments: (string | null)[];
  villaId: number;
  isBridal: boolean;
  onDrop: (villaId: number, slotIndex: number) => void;
  onRemove: (villaId: number, slotIndex: number) => void;
  dragOverSlot: { villaId: number; slotIndex: number } | null;
  onSlotDragOver: (villaId: number, slotIndex: number, e: React.DragEvent) => void;
  onSlotDragLeave: () => void;
}) => (
  <div className={`flex ${bed.size === 2 ? "gap-0" : "gap-1"}`}>
    {Array.from({ length: bed.size }, (_, i) => {
      const slotIndex = startSlot + i;
      return (
        <VillaSlot
          key={slotIndex}
          assignedGuest={assignments[slotIndex]}
          villaId={villaId}
          slotIndex={slotIndex}
          isDouble={bed.size === 2}
          isFirstOfDouble={bed.size === 2 && i === 0}
          isLastOfDouble={bed.size === 2 && i === 1}
          isBridal={isBridal}
          onDrop={onDrop}
          onRemove={onRemove}
          dragOver={dragOverSlot?.villaId === villaId && dragOverSlot?.slotIndex === slotIndex}
          onDragOver={(e) => onSlotDragOver(villaId, slotIndex, e)}
          onDragLeave={onSlotDragLeave}
        />
      );
    })}
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
  const total = totalSlots(villa);
  const isFull = filledCount === total;
  const bedSlotMap = buildBedSlotMap(villa);

  return (
    <div
      className={`
        flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all
        min-w-[80px] sm:min-w-[100px]
        ${villa.bridal
          ? "border-white/70 bg-white/10 shadow-[0_0_12px_2px_rgba(255,255,255,0.2)]"
          : isFull
            ? "border-green-500/50 bg-green-500/10"
            : filledCount > 0
              ? "border-yellow-500/40 bg-yellow-500/5"
              : "border-primary/30 bg-navy-light/50"
        }
      `}
    >
      <span className={`font-bold text-sm ${villa.bridal ? "text-white/60" : "text-orange-400"}`}>{villa.id}</span>
      <Home className={`w-5 h-5 sm:w-6 sm:h-6 ${villa.bridal ? "text-white" : isFull ? "text-green-400" : "text-foreground/70"}`} />
      <span className={`text-[10px] sm:text-xs font-medium uppercase tracking-wide text-center leading-tight ${villa.bridal ? "text-white" : "text-foreground/80"}`}>
        {villa.name}
      </span>
      {villa.bridal && <span className="text-[9px] text-white/50 italic">♥ Bride & Groom</span>}

      {/* Bridal villa: just show names, no bed slots */}
      {villa.bridal ? (
        <div className="flex flex-col items-center gap-0.5 mt-1">
          {assignments.filter(Boolean).map((name, i) => (
            <span key={i} className="text-[10px] text-white/80 italic">{name}</span>
          ))}
        </div>
      ) : (
      /* Rooms row: beds within a room grouped together, rooms separated by divider */
      <div className="flex items-center gap-1 mt-1">
        {villa.rooms.map((room, roomIndex) => {
          // Calculate slotStart for first bed of this room
          const roomSlotStart = villa.rooms
            .slice(0, roomIndex)
            .flat()
            .reduce((s, b) => s + b.size, 0);

          return (
            <React.Fragment key={roomIndex}>
              {roomIndex > 0 && (
                <div className="w-px self-stretch bg-foreground/30 mx-0.5" />
              )}
              <div className="flex gap-1">
                {room.map((bed, bedIndex) => {
                  const bedSlotStart = roomSlotStart + room.slice(0, bedIndex).reduce((s, b) => s + b.size, 0);
                  const entry = bedSlotMap.find((e) => e.startSlot === bedSlotStart);
                  return (
                    <BedSlots
                      key={bedIndex}
                      bed={entry?.bed ?? bed}
                      startSlot={bedSlotStart}
                      assignments={assignments}
                      villaId={villa.id}
                      isBridal={!!villa.bridal}
                      onDrop={onDrop}
                      onRemove={onRemove}
                      dragOverSlot={dragOverSlot}
                      onSlotDragOver={onSlotDragOver}
                      onSlotDragLeave={onSlotDragLeave}
                    />
                  );
                })}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      )}

      {filledCount > 0 && !villa.bridal && (
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

  const allGuestNames = guests.flatMap((g) =>
    g.guestNames.length > 0 ? g.guestNames : [g.name]
  );

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

      for (const vid of Object.keys(next)) {
        const id = Number(vid);
        const idx = next[id].indexOf(draggedGuest);
        if (idx !== -1) {
          next[id] = [...next[id]];
          next[id][idx] = null;
        }
      }

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
      {/* Sidebar */}
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
          {/* Legend */}
          <div className="border-t border-primary/20 mt-3 pt-3 space-y-1.5">
            <p className="text-xs text-foreground/40 mb-1">Legend</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-0">
                <div className="w-4 h-4 rounded-l rounded-r-none border-t border-b border-l bg-rose-900/20 border-rose-400/30" />
                <div className="w-4 h-4 rounded-r rounded-l-none border-t border-b border-r bg-rose-900/20 border-rose-400/30" />
              </div>
              <span className="text-xs text-foreground/50">Double bed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border bg-foreground/5 border-foreground/30" />
              <span className="text-xs text-foreground/50">Single bed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5 items-center">
                <div className="w-4 h-4 rounded border bg-foreground/5 border-foreground/30" />
                <div className="w-px h-3 bg-foreground/30" />
                <div className="w-4 h-4 rounded border bg-foreground/5 border-foreground/30" />
              </div>
              <span className="text-xs text-foreground/50">Room divider</span>
            </div>
          </div>
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
                {renderVilla(14)}
              </div>

              {/* Row 2: Oslo + Alps */}
              <div className="flex justify-center gap-24 sm:gap-32 mb-3">
                {renderVilla(6)}
                {renderVilla(7)}
              </div>

              {/* Row 3: Sicily + Bohemian + Rustic */}
              <div className="flex justify-center gap-12 sm:gap-20 mb-3">
                {renderVilla(4)}
                {renderVilla(5)}
                {renderVilla(8)}
              </div>

              {/* Row 4: Bulgaria + Mexico + Shabby Chic + Arabian Night + Morocco */}
              <div className="flex items-end gap-2 sm:gap-3 mb-3">
                {renderVilla(1)}
                {renderVilla(2)}
                <div className="flex-1" />
                {renderVilla(3)}
                {renderVilla(11)}
                {renderVilla(12)}
              </div>

              {/* Row 5: Cuba + Mykonos + Africa + Costa Rica */}
              <div className="flex items-end gap-2 sm:gap-3 mb-3">
                {renderVilla(0)}
                <div className="flex-1" />
                {renderVilla(9)}
                <div className="flex-1" />
                {renderVilla(10)}
                {renderVilla(13)}
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
              const total = totalSlots(villa);
              return (
                <div
                  key={villa.id}
                  className={`
                    flex items-center gap-2 p-2 rounded-lg text-left
                    ${filled === total
                      ? "bg-green-500/10 border border-green-500/30"
                      : filled > 0
                        ? "bg-yellow-500/5 border border-yellow-500/20"
                        : "bg-navy-light/30 border border-transparent"
                    }
                  `}
                >
                  <span className="text-orange-400 font-bold text-sm w-5 text-right">{villa.id}.</span>
                  <span className="text-foreground/80 text-sm flex-1">{villa.name}</span>
                  <span className="text-[10px] text-foreground/40">{filled}/{total}</span>
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

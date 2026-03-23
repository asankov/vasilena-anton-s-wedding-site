import React, { useState } from "react";
import { GripVertical, X } from "lucide-react";

export interface TableGuest {
  id: string;
  name: string;
  guestNames: string[];
}

interface SeatDef {
  id: number;
  x: number; // % of container width  — center of seat
  y: number; // % of container height — center of seat
}

const SEATS: SeatDef[] = [
  { id: 1, x: 29, y:  7 },
  { id: 2, x: 50, y:  7 },
  { id: 3, x: 71, y:  7 },
  { id: 4, x: 29, y: 80 },
  { id: 5, x: 50, y: 80 },
  { id: 6, x: 71, y: 80 },
  { id: 7, x:  5, y: 43 },
  { id: 8, x: 95, y: 43 },
];

const NUM_TABLES = 4;
const CONTAINER_W = 340;
const CONTAINER_H = 220;
const SEAT_SIZE   = 40;

// assignments[tableIndex][seatIndex]
type Assignments = (string | null)[][];

function initAssignments(): Assignments {
  return Array.from({ length: NUM_TABLES }, () => Array(SEATS.length).fill(null));
}

// --- GuestChip ---
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

// --- Single seat ---
const Seat = ({
  seat,
  guest,
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
}: {
  seat: SeatDef;
  guest: string | null;
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onRemove: () => void;
}) => {
  const left = (seat.x / 100) * CONTAINER_W - SEAT_SIZE / 2;
  const top  = (seat.y / 100) * CONTAINER_H - SEAT_SIZE / 2;

  const base = guest
    ? "bg-primary/30 border-primary/70"
    : dragOver
      ? "bg-primary/20 border-primary scale-110"
      : "bg-navy-light border-primary/40";

  return (
    <div
      style={{ left, top, width: SEAT_SIZE, height: SEAT_SIZE }}
      className={`absolute flex items-center justify-center rounded-xl border-2 transition-all select-none group ${base}`}
      title={guest ?? `Seat ${seat.id}`}
      onDragOver={(e) => { e.preventDefault(); onDragOver(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
    >
      {guest ? (
        <>
          <span className="text-[9px] text-primary font-medium text-center leading-tight px-0.5 truncate w-full text-center">
            {guest.split(" ")[0]}
          </span>
          <button
            onClick={onRemove}
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full items-center justify-center text-white hidden group-hover:flex z-10"
          >
            <X className="w-2 h-2" />
          </button>
        </>
      ) : (
        <span className="text-foreground/40 text-xs font-medium">{seat.id}</span>
      )}
    </div>
  );
};

// --- Table visual ---
const TableVisual = ({
  name,
  assignments,
  dragOverSeat,
  onSeatDragOver,
  onSeatDragLeave,
  onSeatDrop,
  onSeatRemove,
}: {
  name: string;
  assignments: (string | null)[];
  dragOverSeat: number | null;
  onSeatDragOver: (seatIndex: number, e: React.DragEvent) => void;
  onSeatDragLeave: () => void;
  onSeatDrop: (seatIndex: number) => void;
  onSeatRemove: (seatIndex: number) => void;
}) => (
  <div style={{ width: CONTAINER_W, height: CONTAINER_H }} className="relative shrink-0">
    <div
      style={{
        left: 76, top: 44, width: 188, height: 120,
        borderRadius: "40%",
        background: "linear-gradient(135deg, #6b4226 0%, #4a2c14 100%)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
      }}
      className="absolute flex items-center justify-center"
    >
      <span className="text-white/70 font-semibold text-sm tracking-wider uppercase select-none">
        {name}
      </span>
    </div>
    {SEATS.map((seat, i) => (
      <Seat
        key={seat.id}
        seat={seat}
        guest={assignments[i]}
        dragOver={dragOverSeat === i}
        onDragOver={(e) => onSeatDragOver(i, e)}
        onDragLeave={onSeatDragLeave}
        onDrop={() => onSeatDrop(i)}
        onRemove={() => onSeatRemove(i)}
      />
    ))}
  </div>
);

// Wrapper that scales TableVisual to fill the grid cell
type TableVisualProps = React.ComponentProps<typeof TableVisual>;
const TableCell = (props: TableVisualProps) => (
  <div
    style={{ height: CONTAINER_H + 48 }}
    className="flex items-center justify-center"
  >
    <div style={{ transformOrigin: "center center" }}>
      <TableVisual {...props} />
    </div>
  </div>
);

// --- Main component ---
const TableMap = ({ guests }: { guests: TableGuest[] }) => {
  const [assignments, setAssignments] = useState<Assignments>(initAssignments);
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ table: number; seat: number } | null>(null);

  const allGuestNames = guests.flatMap((g) =>
    g.guestNames.length > 0 ? g.guestNames : [g.name]
  );

  const assignedNames = new Set(
    assignments.flat().filter(Boolean) as string[]
  );

  const unassignedGroups = guests
    .map((g) => ({
      inviteName: g.name,
      names: (g.guestNames.length > 0 ? g.guestNames : [g.name]).filter(
        (n) => !assignedNames.has(n)
      ),
    }))
    .filter((g) => g.names.length > 0);

  const handleDragStart = (e: React.DragEvent, name: string) => {
    e.dataTransfer.setData("text/plain", name);
    setDraggedGuest(name);
  };

  const handleSeatDrop = (tableIdx: number, seatIdx: number) => {
    if (!draggedGuest) return;
    if (assignments[tableIdx][seatIdx] !== null) return;

    setAssignments((prev) => {
      const next = prev.map((t) => [...t]);
      // Remove from wherever the guest currently sits
      for (let t = 0; t < next.length; t++) {
        const s = next[t].indexOf(draggedGuest!);
        if (s !== -1) next[t][s] = null;
      }
      next[tableIdx][seatIdx] = draggedGuest;
      return next;
    });

    setDraggedGuest(null);
    setDragOver(null);
  };

  const handleSeatRemove = (tableIdx: number, seatIdx: number) => {
    setAssignments((prev) => {
      const next = prev.map((t) => [...t]);
      next[tableIdx][seatIdx] = null;
      return next;
    });
  };

  const handleDragEnd = () => {
    setDraggedGuest(null);
    setDragOver(null);
  };

  const removeByName = (name: string) => {
    setAssignments((prev) => {
      const next = prev.map((t) => [...t]);
      for (let t = 0; t < next.length; t++) {
        const s = next[t].indexOf(name);
        if (s !== -1) { next[t][s] = null; break; }
      }
      return next;
    });
  };

  const tableProps = (tableIdx: number) => ({
    assignments: assignments[tableIdx],
    dragOverSeat: dragOver?.table === tableIdx ? dragOver.seat : null,
    onSeatDragOver: (seatIdx: number, e: React.DragEvent) => {
      e.preventDefault();
      setDragOver({ table: tableIdx, seat: seatIdx });
    },
    onSeatDragLeave: () => setDragOver(null),
    onSeatDrop: (seatIdx: number) => handleSeatDrop(tableIdx, seatIdx),
    onSeatRemove: (seatIdx: number) => handleSeatRemove(tableIdx, seatIdx),
  });

  return (
    <div
      className="flex gap-6 px-4"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
      onDragEnd={handleDragEnd}
    >
      {/* Sidebar */}
      <div className="w-56 shrink-0">
        <div className="wedding-card sticky top-4">
          <h2 className="text-sm font-serif text-primary mb-3">
            Guests ({allGuestNames.length - assignedNames.size}/{allGuestNames.length})
          </h2>
          {allGuestNames.length === 0 && (
            <p className="text-xs text-foreground/50">No confirmed guests yet</p>
          )}
          {allGuestNames.length > 0 && allGuestNames.length === assignedNames.size && (
            <p className="text-xs text-green-400 mb-2">All guests seated!</p>
          )}
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {unassignedGroups.map((group, gi) => (
              <div key={group.inviteName}>
                {gi > 0 && <div className="border-t border-primary/10 mb-2" />}
                {group.names.length > 1 && (
                  <p className="text-[9px] text-foreground/30 uppercase tracking-wider mb-1 pl-1">
                    {group.inviteName}
                  </p>
                )}
                <div className="space-y-1.5">
                  {group.names.map((name) => (
                    <GuestChip
                      key={name}
                      name={name}
                      onDragStart={(e) => handleDragStart(e, name)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {assignedNames.size > 0 && (
            <>
              <div className="border-t border-primary/20 my-3" />
              <h3 className="text-xs text-foreground/50 mb-2">Seated ({assignedNames.size})</h3>
              <div className="space-y-1.5 max-h-[30vh] overflow-y-auto">
                {Array.from(assignedNames).map((name) => (
                  <GuestChip
                    key={name}
                    name={name}
                    onDragStart={(e) => handleDragStart(e, name)}
                    onRemove={() => removeByName(name)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table layout */}
      <div className="flex-1">
        <div className="wedding-card">
          <h2 className="text-lg font-serif text-primary mb-4">Table Plan</h2>
          {/* Row 1: Tables 1, 2, 3 */}
          <div className="grid grid-cols-3">
            <TableCell name="Table 1" {...tableProps(0)} />
            <TableCell name="Table 2" {...tableProps(1)} />
            <TableCell name="Table 3" {...tableProps(2)} />
          </div>
          {/* Row 2: Table 4 in bottom-right cell */}
          <div className="grid grid-cols-3">
            <div /><div />
            <TableCell name="Table 4" {...tableProps(3)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableMap;

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";

// Meal choice is encoded as:
// "meat:<appetizerId>:<mainId>"  e.g. "meat:appetizer1:main2"
// "vegan"

export interface MealChoice {
  type: "meat" | "vegan";
  appetizer?: "appetizer1" | "appetizer2";
  main?: "main1" | "main2";
}

export function encodeMealChoice(choice: MealChoice): string {
  if (choice.type === "vegan") return "vegan";
  return `meat:${choice.appetizer ?? ""}:${choice.main ?? ""}`;
}

export function decodeMealChoice(value: string): MealChoice | null {
  if (!value) return null;
  if (value === "vegan") return { type: "vegan" };
  if (value.startsWith("meat:")) {
    const parts = value.split(":");
    return {
      type: "meat",
      appetizer: (parts[1] || undefined) as MealChoice["appetizer"],
      main: (parts[2] || undefined) as MealChoice["main"],
    };
  }
  return null;
}

export function mealChoiceLabel(value: string): string {
  const choice = decodeMealChoice(value);
  if (!choice) return "Choose your menu";
  if (choice.type === "vegan") return "Вегетарианско меню";
  const appetizer = choice.appetizer === "appetizer1" ? "Телешки език" : choice.appetizer === "appetizer2" ? "Маринован патладжан" : "—";
  const main = choice.main === "main1" ? "Пилешки филенца" : choice.main === "main2" ? "Крехко телешко" : "—";
  return `Месно меню · ${appetizer} · ${main}`;
}

const meatSalad = {
  name: "Салата – 250 гр.",
  description: "Домат, гриловани тиквички с разядка от патладжан, краве сирене и песто",
  image: null,
};

const meatAppetizers = [
  {
    id: "appetizer1" as const,
    name: "Маринован телешки език",
    description: "Маринован телешки език с млечен дип, едрозърнеста горчица, хрупкаво хлебче с масло и перли от кисели краставички – 180 гр.",
    image: null,
  },
  {
    id: "appetizer2" as const,
    name: "Маринован патладжан",
    description: "Маринован патладжан с черница, микс от авокадо и сирене със заатар – 180 гр.",
    image: null,
  },
];

const meatMains = [
  {
    id: "main1" as const,
    name: "Пилешки филенца",
    description: "Пилешки филенца с дижонски сос, чипс от кейл върху тартар от елда с печени зеленчуци и винегрет – 350 гр.",
    image: null,
  },
  {
    id: "main2" as const,
    name: "Крехко телешко",
    description: "Крехко телешко, завито в панчета с трюфел и пате от гъши дроб, поднесено със сотирани моркови и печен сос – 350 гр.",
    image: null,
  },
];

const veganCourses = [
  {
    name: "Салата – 250 гр.",
    description: `Салата „Цезар" с тофу`,
    image: null,
  },
  {
    name: "Предястие – 180 гр.",
    description: "Маринован патладжан с черница, микс от авокадо и сирене със заатар",
    image: null,
  },
  {
    name: "Основно – 350 гр.",
    description: "Стек от целина, пюре от морков с джинджифил и кокосово мляко, аспержи, сос от червена боровинка",
    image: null,
  },
];

interface Props {
  guestName: string;
  value: string;
  onChange: (value: string) => void;
}

type Step = "menu-type" | "appetizer" | "main" | "summary";

export default function MealChoiceDialog({ guestName, value, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const existing = decodeMealChoice(value);
  const [menuType, setMenuType] = useState<"meat" | "vegan" | null>(existing?.type ?? null);
  const [appetizer, setAppetizer] = useState<MealChoice["appetizer"]>(existing?.appetizer ?? undefined);
  const [main, setMain] = useState<MealChoice["main"]>(existing?.main ?? undefined);
  const [step, setStep] = useState<Step>("menu-type");

  const openDialog = () => {
    // Reset to existing values when opening
    const c = decodeMealChoice(value);
    setMenuType(c?.type ?? null);
    setAppetizer(c?.appetizer ?? undefined);
    setMain(c?.main ?? undefined);
    setStep("menu-type");
    setOpen(true);
  };

  const closeDialog = () => setOpen(false);

  const handleSelectMenuType = (type: "meat" | "vegan") => {
    setMenuType(type);
    if (type === "vegan") {
      setStep("summary");
    } else {
      setAppetizer(undefined);
      setMain(undefined);
      setStep("appetizer");
    }
  };

  const handleSelectAppetizer = (id: MealChoice["appetizer"]) => {
    setAppetizer(id);
    setStep("main");
  };

  const handleSelectMain = (id: MealChoice["main"]) => {
    setMain(id);
    setStep("summary");
  };

  const handleConfirm = () => {
    if (!menuType) return;
    if (menuType === "vegan") {
      onChange("vegan");
    } else if (appetizer && main) {
      onChange(`meat:${appetizer}:${main}`);
    }
    setOpen(false);
  };

  const isComplete = menuType === "vegan" || (menuType === "meat" && appetizer && main);

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={openDialog}
        className={`w-full wedding-input text-left flex items-center justify-between cursor-pointer hover:border-primary transition-all ${
          value ? "text-foreground" : "text-foreground/40"
        }`}
      >
        <span className="text-sm">{value ? mealChoiceLabel(value) : "Choose your menu"}</span>
        <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
      </button>

      {/* Dialog overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(8, 17, 31, 0.85)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) closeDialog(); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto wedding-card"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-foreground font-medium text-lg">{guestName}</h3>
                  <p className="text-foreground/50 text-sm">Choose your menu</p>
                </div>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="p-2 rounded-full hover:bg-primary/10 text-foreground/50 hover:text-foreground transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Step indicator */}
              <StepIndicator step={step} menuType={menuType} />

              {/* Step: choose menu type */}
              {step === "menu-type" && (
                <MenuTypeStep onSelect={handleSelectMenuType} />
              )}

              {/* Step: choose appetizer (meat only) */}
              {step === "appetizer" && (
                <AppetizerStep
                  selected={appetizer}
                  onSelect={handleSelectAppetizer}
                  onBack={() => setStep("menu-type")}
                />
              )}

              {/* Step: choose main (meat only) */}
              {step === "main" && (
                <MainStep
                  selected={main}
                  onSelect={handleSelectMain}
                  onBack={() => setStep("appetizer")}
                />
              )}

              {/* Summary */}
              {step === "summary" && (
                <SummaryStep
                  menuType={menuType!}
                  appetizer={appetizer}
                  main={main}
                  onBack={() => {
                    if (menuType === "vegan") setStep("menu-type");
                    else setStep("main");
                  }}
                  onConfirm={handleConfirm}
                  isComplete={!!isComplete}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Step indicator ──────────────────────────────────────────────────────────

function StepIndicator({ step, menuType }: { step: Step; menuType: "meat" | "vegan" | null }) {
  const steps = menuType === "vegan"
    ? ["Меню", "Преглед"]
    : ["Меню", "Предястие", "Основно", "Преглед"];

  const stepIndex = menuType === "vegan"
    ? ["menu-type", "summary"].indexOf(step)
    : ["menu-type", "appetizer", "main", "summary"].indexOf(step);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 text-xs ${i <= stepIndex ? "text-primary" : "text-foreground/30"}`}>
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${i < stepIndex ? "bg-primary border-primary" : i === stepIndex ? "border-primary" : "border-foreground/20"}`}>
              {i < stepIndex ? <Check className="w-3 h-3 text-primary-foreground" /> : <span>{i + 1}</span>}
            </div>
            <span className="hidden sm:inline">{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-px w-6 ${i < stepIndex ? "bg-primary" : "bg-foreground/20"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Menu type step ───────────────────────────────────────────────────────────

function MenuTypeStep({ onSelect }: { onSelect: (t: "meat" | "vegan") => void }) {
  return (
    <div>
      <h4 className="text-foreground/70 text-sm mb-4">Изберете вашето меню</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MenuTypeCard
          title="Месно меню"
          description="Салата · Избор на предястие · Избор на основно"
          tags={["Салата", "2 варианта предястие", "2 варианта основно"]}
          onClick={() => onSelect("meat")}
        />
        <MenuTypeCard
          title="Вегетарианско меню"
          description="Изцяло растително меню"
          tags={["Салата", "Маринован патладжан", "Стек от целина"]}
          onClick={() => onSelect("vegan")}
        />
      </div>
    </div>
  );
}

function MenuTypeCard({
  title,
  description,
  tags,
  onClick,
}: {
  title: string;
  description: string;
  tags: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left p-4 rounded-lg border-2 border-primary/30 hover:border-primary bg-navy-light/30 hover:bg-primary/5 transition-all group"
    >
      <p className="text-foreground font-medium mb-1">{title}</p>
      <p className="text-foreground/50 text-xs mb-3">{description}</p>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary/80">
            {t}
          </span>
        ))}
      </div>
    </button>
  );
}

// ─── Appetizer step ───────────────────────────────────────────────────────────

function AppetizerStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: MealChoice["appetizer"];
  onSelect: (id: MealChoice["appetizer"]) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-foreground/70 text-sm">Изберете предястие</h4>
        <button type="button" onClick={onBack} className="text-xs text-primary hover:underline">← Назад</button>
      </div>
      <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
        <p className="text-xs text-foreground/50 font-medium uppercase tracking-wider mb-1">{meatSalad.name}</p>
        <p className="text-sm text-foreground/70">{meatSalad.description}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {meatAppetizers.map((item) => (
          <DishCard
            key={item.id}
            name={item.name}
            description={item.description}
            selected={selected === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main course step ─────────────────────────────────────────────────────────

function MainStep({
  selected,
  onSelect,
  onBack,
}: {
  selected: MealChoice["main"];
  onSelect: (id: MealChoice["main"]) => void;
  onBack: () => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-foreground/70 text-sm">Изберете основно ястие</h4>
        <button type="button" onClick={onBack} className="text-xs text-primary hover:underline">← Назад</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {meatMains.map((item) => (
          <DishCard
            key={item.id}
            name={item.name}
            description={item.description}
            selected={selected === item.id}
            onClick={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Summary step ─────────────────────────────────────────────────────────────

function SummaryStep({
  menuType,
  appetizer,
  main,
  onBack,
  onConfirm,
  isComplete,
}: {
  menuType: "meat" | "vegan";
  appetizer: MealChoice["appetizer"];
  main: MealChoice["main"];
  onBack: () => void;
  onConfirm: () => void;
  isComplete: boolean;
}) {
  const appetizerInfo = meatAppetizers.find((a) => a.id === appetizer);
  const mainInfo = meatMains.find((m) => m.id === main);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-foreground/70 text-sm">Вашият избор</h4>
        <button type="button" onClick={onBack} className="text-xs text-primary hover:underline">← Назад</button>
      </div>

      {menuType === "vegan" ? (
        <div className="space-y-3 mb-8">
          {veganCourses.map((course) => (
            <SummaryCourse key={course.name} label={course.name} dish={course.description} />
          ))}
        </div>
      ) : (
        <div className="space-y-3 mb-8">
          <SummaryCourse label={meatSalad.name} dish={meatSalad.description} />
          {appetizerInfo && <SummaryCourse label="Appetizer" dish={appetizerInfo.name} />}
          {mainInfo && <SummaryCourse label="Main Course" dish={mainInfo.name} />}
        </div>
      )}

      <button
        type="button"
        onClick={onConfirm}
        disabled={!isComplete}
        className="wedding-button w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        Потвърди избора
      </button>
    </div>
  );
}

function SummaryCourse({ label, dish }: { label: string; dish: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
      <Check className="w-4 h-4 text-primary shrink-0" />
      <div>
        <p className="text-xs text-foreground/40 uppercase tracking-wider">{label}</p>
        <p className="text-sm text-foreground">{dish}</p>
      </div>
    </div>
  );
}

// ─── Dish card ────────────────────────────────────────────────────────────────

function DishCard({
  name,
  description,
  selected,
  onClick,
}: {
  name: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left p-4 rounded-lg border-2 transition-all ${
        selected
          ? "border-primary bg-primary/10"
          : "border-primary/30 hover:border-primary/60 bg-navy-light/30 hover:bg-primary/5"
      }`}
    >
      {/* Placeholder image */}
      <div className={`w-full h-36 rounded-md mb-3 flex items-center justify-center border transition-all ${
        selected ? "bg-primary/20 border-primary/30" : "bg-primary/10 border-primary/10"
      }`}>
        {selected ? (
          <Check className="w-8 h-8 text-primary" />
        ) : (
          <span className="text-foreground/20 text-xs">Photo coming soon</span>
        )}
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`font-medium text-sm mb-1 ${selected ? "text-primary" : "text-foreground"}`}>{name}</p>
          <p className="text-foreground/50 text-xs leading-relaxed">{description}</p>
        </div>
        {selected && (
          <div className="w-5 h-5 rounded-full bg-primary shrink-0 flex items-center justify-center mt-0.5">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
        )}
      </div>
    </button>
  );
}

import Navigation from "@/components/wedding/Navigation";
import WelcomeSection from "@/components/wedding/WelcomeSection";
import CountdownSection from "@/components/wedding/CountdownSection";
import LocationSection from "@/components/wedding/LocationSection";
import AgendaSection from "@/components/wedding/AgendaSection";
import RSVPSection from "@/components/wedding/RSVPSection";

const Index = () => {
  return (
    <div className="bg-background min-h-screen">
      <Navigation />
      <WelcomeSection />
      <CountdownSection />
      <LocationSection />
      <AgendaSection />
      <RSVPSection />

      {/* Footer */}
      <footer className="py-12 text-center border-t border-primary/10">
        <p className="font-serif text-2xl text-primary mb-2">V & A</p>
        <p className="text-foreground/50 text-sm font-sans">
          We can't wait to celebrate with you
        </p>
      </footer>
    </div>
  );
};

export default Index;

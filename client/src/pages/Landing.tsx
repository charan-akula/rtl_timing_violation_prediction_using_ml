import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { Cpu } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { setCurrentStep } = useAppContext();

  const handleGetStarted = () => {
    setCurrentStep(1);
    navigate('/input-mode');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* Left Side - Title */}
          <div className="flex items-center">
<h1 className="text-6xl md:text-7xl font-extrabold leading-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">

  RTL Timing <br />
  Violation Prediction <br />
  using <br />
  Ma
  <span className="text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">c</span>
  <span className="text-accent drop-shadow-[0_0_6px_rgba(99,102,241,0.3)]">h</span>

  ine <br />
<span className="mx-1 text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.8)]">🤖</span>

{/* &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
Le
  <span className="text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">a</span>
  <span className="text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">r</span>
  <span className="text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">a</span>
  <span className="text-accent drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]">n</span>
  ing
</h1>




{/* <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight">
  RTL Timing <br />
  Violation Prediction<br />
  using <br />
  Machine LearninG <br />

</h1> */}
{/* <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-[1.05] tracking-tighter drop-shadow-md">
  ML-Based <br />
  RTL Timing <br />
  Violation Prediction
</h1> */}

{/* <h1 className="text-7xl md:text-8xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-tight tracking-tight">
  ML-Based <br />
  RTL Timing <br />
  Violation Prediction
</h1> */}



          </div>

          {/* Right Side - Description and Button */}
          <div className="space-y-6 flex flex-col justify-between h-full">
            <p className="text-muted-foreground text-lg leading-relaxed text-justify">
              Timing violations are a major challenge in digital circuit design, often causing functional errors and costly re-spins. Traditional EDA tools detect these issues late in the design flow (e.g., during logic synthesis), limiting opportunities for early optimization.
              <br /><br />
              Here, we propose a machine learning–based framework that predicts timing violations directly from Register-Transfer Level (RTL) designs. Using the PyVerilog module, the framework automatically extracts key structural features such as gate counts, fan-in/fan-out, logic depth, and connectivity. These are then analyzed using a Decision Tree classifier, achieving ~80% prediction accuracy.
              <br /><br />
              <strong className="text-foreground">Note:</strong> This model currently supports pure gate-level RTL designs with explicit gate instances and up to 7 nodes (gates). Behavioral constructs (always, if, etc.) are not supported.
            </p>

            <Button 
              onClick={handleGetStarted} 
              size="lg"
              className="bg-accent hover:bg-accent/90 text-lg px-8 py-6 w-full md:w-auto"
            >
              Get Started
              <ChevronRight className="ml-2" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

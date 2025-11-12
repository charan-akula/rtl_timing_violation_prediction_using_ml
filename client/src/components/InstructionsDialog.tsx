import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

export function InstructionsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Info className="mr-2" size={16} />
          Read Instructions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Instructions for Providing RTL Code</DialogTitle>
          <DialogDescription>
            Please follow these guidelines carefully to ensure successful analysis
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[65vh] pr-4">
          <div className="space-y-6 text-sm">
            <div>
              <p className="text-muted-foreground mb-4">
                Please provide pure gate-level Verilog code following these rules:
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">1. Use only basic gate and sequential element instantiations</h3>
              <p className="text-muted-foreground mb-2">Each gate must have a defined instance name.</p>
              <div className="bg-secondary/50 p-4 rounded-lg font-mono text-xs">
                <pre>NAND nand1(n1, d[0], d[1]);{'\n'}NOT not1(n4, n3);{'\n'}REG r0(q, n4, clk, 1'b0);</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">2. Node Count Requirements</h3>
              <p className="text-muted-foreground">
                The code must contain at least <strong>2</strong> and at most <strong>7</strong> gate instances (nodes).
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">3. Structural Code Only</h3>
              <p className="text-muted-foreground">
                The design should be fully structural, without behavioral constructs like <code className="bg-secondary px-1 py-0.5 rounded">always</code>, <code className="bg-secondary px-1 py-0.5 rounded">if</code>, or <code className="bg-secondary px-1 py-0.5 rounded">assign</code>.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">4. Allowed Gate Types</h3>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {['AND', 'OR', 'NAND', 'NOR', 'XOR', 'NOT', 'DFF', 'REG', 'SRFF', 'TFF', 'JFF', 'ADD', 'SUB'].map(gate => (
                  <span key={gate} className="bg-accent/10 text-accent px-2 py-1 rounded text-center">
                    {gate}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">5. Proper Verilog Module Syntax</h3>
              <div className="bg-secondary/50 p-4 rounded-lg font-mono text-xs">
                <pre>module module_name(input ..., output ...);{'\n'}  wire ...;{'\n'}  // Gate instantiations{'\n'}endmodule</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">6. Single Logic Block</h3>
              <p className="text-muted-foreground">
                The input should represent a single logic block — not hierarchical or multi-module designs.
              </p>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-destructive">⚠️ Important Notes:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Designs exceeding 7 nodes or less than 2 nodes will not be processed</li>
                <li>Missing gate instances will result in analysis failure</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Example of Valid Input:</h3>
              <div className="bg-secondary/50 p-4 rounded-lg font-mono text-xs">
                <pre>{`module balanced_logic(input clk, input [3:0] d, output q);
  wire n1, n2, n3, n4;
  NAND nand1(n1, d[0], d[1]);
  NAND nand2(n2, d[2], d[3]);
  NAND nand3(n3, n1, n2);
  NOT not1(n4, n3);
  REG r0(q, n4, clk, 1'b0);
endmodule`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">For More Code Samples:</h3>
              <a 
                href="https://docs.google.com/document/d/1dP0V0LwK18nbfxCuQIaZSdA8UpNKy4OZSPjxAuDKxLo/edit?usp=drive_link" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center gap-1"
              >
                View Sample Codes →
              </a>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

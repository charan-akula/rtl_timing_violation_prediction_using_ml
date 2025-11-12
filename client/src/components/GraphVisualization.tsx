import { useEffect, useRef } from 'react';

interface GraphVisualizationProps {
  adjacencyMatrix: number[][];
  nodeCount: number;
  nodeLabels?: string[];
}

export function GraphVisualization({ adjacencyMatrix, nodeCount, nodeLabels }: GraphVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate node positions in a circle
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;

    const nodePositions: { x: number; y: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount - Math.PI / 2;
      nodePositions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }

    // Draw edges
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);

    for (let i = 0; i < nodeCount; i++) {
      for (let j = 0; j < nodeCount; j++) {
        if (adjacencyMatrix[i][j] === 1) {
          const from = nodePositions[i];
          const to = nodePositions[j];

          // Draw line
          const nodeRadius = 35; // same as below

          for (let i = 0; i < nodeCount; i++) {
            for (let j = 0; j < nodeCount; j++) {
              if (adjacencyMatrix[i][j] === 1) {
                const from = nodePositions[i];
                const to = nodePositions[j];

                // Calculate direction and offset to edge of circles
                const angle = Math.atan2(to.y - from.y, to.x - from.x);
                const startX = from.x + nodeRadius * Math.cos(angle);
                const startY = from.y + nodeRadius * Math.sin(angle);
                const endX = to.x - nodeRadius * Math.cos(angle);
                const endY = to.y - nodeRadius * Math.sin(angle);

                // Draw edge line
                ctx.strokeStyle = '#22c55e';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Draw arrowhead
                const arrowLength = 12;
                const arrowAngle = Math.PI / 7;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(
                  endX - arrowLength * Math.cos(angle - arrowAngle),
                  endY - arrowLength * Math.sin(angle - arrowAngle)
                );
                ctx.moveTo(endX, endY);
                ctx.lineTo(
                  endX - arrowLength * Math.cos(angle + arrowAngle),
                  endY - arrowLength * Math.sin(angle + arrowAngle)
                );
                ctx.stroke();
    }
  }
}

        }
      }
    }

    // Draw nodes
    const nodeRadius = 35;
    const nodeColors = [
      '#60A5FA', // blue
      '#34D399', // green
      '#F472B6', // pink
      '#FBBF24', // yellow
      '#A78BFA', // purple
      '#FB923C', // orange
      '#22D3EE', // cyan
    ];
    
    for (let i = 0; i < nodeCount; i++) {
      const pos = nodePositions[i];

      // Draw circle with light colors
      ctx.fillStyle = nodeColors[i % nodeColors.length];
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#2d2d2dff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#ffffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = nodeLabels && nodeLabels[i] ? nodeLabels[i] : `n${i}`;
      ctx.fillText(label, pos.x, pos.y);
    }
  }, [adjacencyMatrix, nodeCount]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={600}
        className="border border-border rounded-lg bg-secondary/20"
      />
    </div>
  );
}

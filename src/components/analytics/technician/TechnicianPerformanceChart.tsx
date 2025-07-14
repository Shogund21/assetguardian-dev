
import React, { useState } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LabelList
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TechnicianStatsData {
  name: string;
  completed: number;
  pending: number;
  issues: number;
  total: number;
  percentage?: number; // Added for percentage calculation
}

interface TechnicianPerformanceChartProps {
  data: TechnicianStatsData[];
}

const TechnicianPerformanceChart: React.FC<TechnicianPerformanceChartProps> = ({ data }) => {
  const isMobile = useIsMobile();
  const [truncatedNames, setTruncatedNames] = useState<Record<string, boolean>>({});
  
  // Process data to include percentage based on total tasks
  const processedData = data.map(tech => ({
    ...tech,
    percentage: tech.total > 0 ? Math.round((tech.completed / tech.total) * 100) : 0
  }));
  
  console.log('Chart data received:', data);
  console.log('Processed chart data:', processedData);
  
  // Function to check if a name is truncated and store the result
  const checkIfTruncated = (name: string) => {
    const limit = isMobile ? 14 : 18;
    const isTruncated = name.length > limit;
    
    if (truncatedNames[name] !== isTruncated) {
      setTruncatedNames(prev => ({
        ...prev,
        [name]: isTruncated
      }));
    }
    
    return isTruncated;
  };
  
  // Custom Y-axis Tick with Tooltip
  const CustomYAxisTick = (props: any) => {
    const { x, y, payload } = props;
    const name = payload.value;
    const limit = isMobile ? 14 : 18;
    const displayName = name.length > limit ? `${name.slice(0, limit)}...` : name;
    const isTruncated = checkIfTruncated(name);
    
    return (
      <g transform={`translate(${x},${y})`}>
        {isTruncated ? (
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <text
                  x={0}
                  y={0}
                  dy={4}
                  textAnchor="end"
                  fill="#333"
                  fontSize={isMobile ? 11 : 12}
                  fontWeight={500}
                >
                  {displayName}
                </text>
              </TooltipTrigger>
              <TooltipContent side="left" className="z-50 font-medium">
                {name}
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        ) : (
          <text
            x={0}
            y={0}
            dy={4}
            textAnchor="end"
            fill="#333"
            fontSize={isMobile ? 11 : 12}
            fontWeight={500}
          >
            {displayName}
          </text>
        )}
      </g>
    );
  };
  
  return (
    <div className="min-w-[400px] overflow-x-auto">
      <ResponsiveContainer width="100%" height={data.length * 45 + 50}>
        <BarChart
          data={processedData}
          layout="vertical"
          margin={{
            top: 20,
            right: isMobile ? 80 : 120,
            left: isMobile ? 120 : 150,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            type="number" 
            tick={{ fontSize: isMobile ? 11 : 12, fontWeight: 500 }}
            domain={[0, 'dataMax + 5']} 
            padding={{ left: 0, right: 10 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={<CustomYAxisTick />}
            width={isMobile ? 120 : 150}
            scale="band"
          />
          <Tooltip 
            contentStyle={{ 
              fontSize: isMobile ? '12px' : '14px', 
              fontWeight: 'medium', 
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }} 
            formatter={(value, name) => {
              if (name === "completed") {
                return [`${value} tasks`, 'Completed'];
              } else if (name === "pending") {
                return [`${value} tasks`, 'Pending'];
              } else if (name === "issues") {
                return [`${value} tasks`, 'Issues Found'];
              }
              return [value, name];
            }}
            wrapperStyle={{ zIndex: 1000 }}
          />
          <Bar 
            dataKey="completed" 
            stackId="tasks"
            name="completed" 
            fill="#22c55e" 
          />
          <Bar 
            dataKey="pending" 
            stackId="tasks"
            name="pending" 
            fill="#f59e0b" 
          />
          <Bar 
            dataKey="issues" 
            stackId="tasks"
            name="issues" 
            fill="#ef4444" 
          >
            <LabelList 
              dataKey="total" 
              position="right" 
              style={{ 
                fontSize: 11,
                fontWeight: 'bold',
                fill: '#333'
              }}
              formatter={(value: number) => `${value} total`}
              offset={10}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TechnicianPerformanceChart;

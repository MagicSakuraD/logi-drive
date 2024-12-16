"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const initialChartData = Array(30).fill({
  time: new Date().toISOString(),
  angle: 0,
});

interface SteerChartProps {
  angle: number;
}

const chartConfig = {
  views: {
    label: "角度变化",
  },
  steer: {
    label: "angle",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface ChartConfig {
  views: {
    label: string;
  };
  steer: {
    label: string;
    color: string;
  };
}

export function SteerChart({ angle }: SteerChartProps) {
  const [chartData, setChartData] = React.useState(initialChartData);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setChartData((prevData) => {
        const newData = [
          ...prevData,
          { time: new Date().toISOString(), angle }, // 使用 ISO 时间字符串
        ];
        if (newData.length > 30) {
          newData.shift();
        }
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [angle]);

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <h2 className="text-lg font-semibold">实时角度变化</h2>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          className="aspect-auto h-[250px] w-full"
          config={chartConfig}
        >
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 20,
              left: 10,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).getSeconds().toString()}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="angle"
                  labelFormatter={(value) =>
                    `时间: ${new Date(value).toLocaleTimeString()}`
                  }
                />
              }
            />
            <Line
              type="linear"
              dataKey="angle"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

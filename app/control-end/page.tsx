"use client";
import { Card } from "@/components/ui/card";

import React, { useEffect, useRef, useState } from "react";
import Gamepad from "./components/Gamepad";

const ControlEnd = () => {
  const [axes, setAxes] = useState<{
    rotation: number;
    brake: number;
    throttle: number;
  }>({
    rotation: 0,
    brake: 0,
    throttle: 0,
  });
  const [currentGear, setCurrentGear] = useState<string>("N");
  // 用于保存反馈速度的 state
  const [feedbackSpeed, setFeedbackSpeed] = useState<number>(0);

  //   const intervalRef = useRef<NodeJS.Timeout | null>(null);

  //   useEffect(() => {
  //     let animationFrameId: number;
  //     const sendControlData = () => {

  //       // 递归调用 requestAnimationFrame 以实现循环发送
  //       animationFrameId = requestAnimationFrame(sendControlData);
  //     };

  //     // 启动循环发送
  //     animationFrameId = requestAnimationFrame(sendControlData);

  //     return () => cancelAnimationFrame(animationFrameId);
  //   }, [axes, currentGear]);

  return (
    <div className="w-full min-[2460px]:w-5/6 flex flex-col gap-3 p-3 my-auto justify-center h-full">
      <Card className=" backdrop-blur-xl bg-background/30">
        <div className="flex flex-row gap-4 p-2">
          <Gamepad
            axes={axes}
            setAxes={setAxes}
            currentGear={currentGear}
            setCurrentGear={setCurrentGear}
            feedbackSpeed={feedbackSpeed}
          />
        </div>
      </Card>
    </div>
  );
};

export default ControlEnd;

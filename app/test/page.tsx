"use client";
import { Card } from "@/components/ui/card";

import React, { useEffect, useRef, useState } from "react";
import Gamepad from "./components/Gamepad";
import ROSLIB from "roslib";
import { SteerChart } from "./components/chart";

const TestPage = () => {
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
  const rosRef = useRef<ROSLIB.Ros | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const steerforceRef = useRef<number>(0);

  useEffect(() => {
    if (!rosRef.current) {
      const ros = new ROSLIB.Ros({ url: "ws://10.181.93.187:9090" });

      ros.on("connection", () => {
        console.log("成功连接到ROS.");
      });

      ros.on("error", (error) => {
        console.error("无法连接ROS:", error);
      });

      rosRef.current = ros;

      //订阅steer_test话题
      const steer_testListener = new ROSLIB.Topic({
        ros: rosRef.current,
        name: "/rock_can/steer_test",
        messageType: "std_msgs/Float32",
      });

      steer_testListener.subscribe((message: any) => {
        if (message) {
          console.log("steer_test", message.data);
          steerforceRef.current = message.data;
        }
      });
    }

    //测试
    const steerTopic = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/rock_can/steer_pub",
      messageType: "std_msgs/Float32",
    });

    // 发布方向盘角度话题 ff_targetff_target
    const steerTopic_ff_target = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/ff_target",
      messageType: "g29_force_feedback/ForceFeedback",
    });

    const sendControlData = () => {
      // 递归调用 requestAnimationFrame 以实现循环发送
      const steerDataMessage = new ROSLIB.Message({
        data: 5,
      });

      //测试方向盘角度力反馈
      const steerDataMessage_ff_target = new ROSLIB.Message({
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: "1" },
        angle: steerforceRef.current,
        force: 0.2,
        pid_mode: true,
      });

      console.log(
        "steerforceRef.current",
        steerforceRef.current,
        steerDataMessage_ff_target
      );

      steerTopic_ff_target.publish(steerDataMessage_ff_target);

      steerTopic.publish(steerDataMessage);
    };

    animationFrameIdRef.current = requestAnimationFrame(sendControlData);

    return () => {
      if (rosRef.current) {
        rosRef.current.close();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full min-[2460px]:w-5/6 flex flex-col gap-3 p-3 mx-auto justify-center h-full">
      <SteerChart angle={steerforceRef.current} />
      <Card className="w-3/5 backdrop-blur-xl bg-background/30 mx-auto">
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

export default TestPage;

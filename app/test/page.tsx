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
  const logiSteerRef = useRef<number>(0);

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

      // 订阅 steer_test 话题
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

    // 创建发布话题
    const steerTopic = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/rock_can/steer_pub",
      messageType: "std_msgs/Float32",
    });

    // 创建力反馈话题
    const steerTopic_ff_target = new ROSLIB.Topic({
      ros: rosRef.current,
      name: "/ff_target",
      messageType: "ros_g29_force_feedback/ForceFeedback",
    });

    const sendControlData = () => {
      // 发布方向盘角度数据
      const steerDataMessage = new ROSLIB.Message({
        data: logiSteerRef.current,
      });

      // 发布力反馈数据
      const steerDataMessage_ff_target = new ROSLIB.Message({
        header: { stamp: { sec: 0, nanosec: 0 }, frame_id: "" },
        angle: steerforceRef.current,
        force: 0.1,
        pid_mode: true,
      });

      console.log("steerforceRef.current", steerDataMessage_ff_target);

      // steerTopic_ff_target.publish(steerDataMessage_ff_target);
      steerTopic.publish(steerDataMessage);
      steerTopic_ff_target.publish(steerDataMessage_ff_target);

      // 递归调用 requestAnimationFrame 实现循环发送
      animationFrameIdRef.current = requestAnimationFrame(sendControlData);
    };

    // 初始调用 sendControlData
    sendControlData();

    // 清理工作
    return () => {
      if (rosRef.current) {
        rosRef.current.close();
      }
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    logiSteerRef.current = axes.rotation;
  }, [axes]);

  return (
    <div className="w-full min-[2460px]:w-5/6 flex flex-col gap-3 p-3 mx-auto justify-center h-full">
      {/* <SteerChart angle={steerforceRef.current} /> */}
      {/* <h2>接受到的角度：{steerforceRef.current}</h2> */}
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

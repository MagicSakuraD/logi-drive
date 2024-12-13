/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { CircleAlert } from "lucide-react";
import Pedal from "./Pedal";
import GearShift from "./GearShift";
import Gauge from "./Gauge";
import { Button } from "@/components/ui/button";
import SteerWheel from "./SteerWheel";

interface GamepadProps {
  axes: {
    rotation: number;
    brake: number;
    throttle: number;
  };
  setAxes: React.Dispatch<
    React.SetStateAction<{
      rotation: number;
      brake: number;
      throttle: number;
    }>
  >;
  currentGear: string;
  setCurrentGear: React.Dispatch<React.SetStateAction<string>>;
  feedbackSpeed: number;
}

const logDeviceInfo = (device: HIDDevice) => {
  console.log("Device Info:", device.productName);
  for (const collection of device.collections) {
    console.log(`Usage: ${collection.usage}`);
    console.log(`Usage page: ${collection.usagePage}`);
  }
};

const Gamepad: React.FC<GamepadProps> = ({
  axes,
  setAxes,
  currentGear,
  setCurrentGear,
  feedbackSpeed,
}) => {
  const [device, setDevice] = useState<HIDDevice | null>(null);
  const [isHIDSupported, setIsHIDSupported] = useState<boolean>(true);

  const connectHIDDevice = async () => {
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [
          { vendorId: 0x046d, productId: 0xc266 }, // Logitech G923
          { usagePage: 0x01, usage: 0x04 }, // 示例十六进制转化
        ],
      });

      if (devices.length > 0) {
        const selectedDevice = devices[0];
        if (!selectedDevice.opened) {
          await selectedDevice.open();
          console.log("HID Device opened:", selectedDevice);
        }
        setDevice(selectedDevice);
        logDeviceInfo(selectedDevice);
      } else {
        console.warn("No HID devices found matching filters.");
      }
    } catch (error) {
      console.error("Failed to connect HID device:", error);
    }
  };

  useEffect(() => {
    if ("hid" in navigator) {
      setIsHIDSupported(true);
      console.log("WebHID API supported");

      const handleDisconnect = (event: HIDConnectionEvent) => {
        if (event.device === device) {
          console.log("HID device disconnected:", event.device);
          setDevice(null);
        }
      };

      navigator.hid.addEventListener("disconnect", handleDisconnect);

      return () => {
        navigator.hid.removeEventListener("disconnect", handleDisconnect);
      };
    } else {
      setIsHIDSupported(false);
      console.error("WebHID API is not supported in this browser.");
    }
  }, [device]);

  useEffect(() => {
    const handleInputReport = (event: HIDInputReportEvent) => {
      console.log("handleInputReport run");
      try {
        const { data } = event;

        if (!data || data.byteLength < 8) {
          console.error("Invalid or insufficient HID data.");
          return;
        }

        const view = new DataView(data.buffer);
        const newAxes = {
          rotation: Math.round((view.getInt16(0, true) / 32768) * 450), // 小端序
          brake: parseFloat(((255 - view.getUint8(2)) / 255).toFixed(2)), // 刹车
          throttle: parseFloat(((255 - view.getUint8(3)) / 255).toFixed(2)), // 油门
        };
        setAxes(newAxes);

        const buttonStates = [4, 5, 6, 7].map((offset) =>
          view.getUint8(offset)
        );
        if (buttonStates[0]) setCurrentGear("P");
        else if (buttonStates[1]) setCurrentGear("R");
        else if (buttonStates[2]) setCurrentGear("N");
        else if (buttonStates[3]) setCurrentGear("D");
      } catch (error) {
        console.error("Error processing HID input report:", error);
      }
    };

    if (device) {
      if (!device.opened) {
        device
          .open()
          .catch((error) => console.error("Error opening device:", error));
      }
      console.log(device,"device open");

      device.addEventListener("inputreport", handleInputReport);
      console.log("Listening for HID input reports.");

      return () => {
        device.removeEventListener("inputreport", handleInputReport);
      };
    }
  }, [device, setAxes, setCurrentGear]);

  return (
    <div className="flex flex-row items-center justify-between bg-transparent w-full h-full">
      {isHIDSupported ? (
        <>
          {device ? (
            <div className="flex flex-row justify-between gap-3 w-full items-center">
              <Pedal brake={axes.brake} throttle={axes.throttle} />
              <div>
                <div className="text-sm text-muted-foreground">转角</div>
                <div className="text-xl font-bold tabular-nums leading-none w-5">
                  {axes.rotation}°
                </div>
              </div>
              <SteerWheel rotation={axes.rotation} />
              <GearShift gear={currentGear} />
              <Gauge
                value={parseFloat((feedbackSpeed * 0.036).toFixed(1))}
                min={0}
                max={100}
                label="Speed"
                units="km/h"
              />
            </div>
          ) : (
            <div className="flex flex-row items-center justify-center w-full h-20">
              <div className="text-foreground/80 flex flex-row gap-1 items-center justify-center w-full mb-2">
                <CircleAlert color="#ea580c" className="w-5 h-5" />
                未连接设备
                <Button onClick={connectHIDDevice} className="ml-4">
                  连接设备
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <h3 className="text-xl">此浏览器不支持 WebHID API</h3>
      )}
    </div>
  );
};

export default Gamepad;

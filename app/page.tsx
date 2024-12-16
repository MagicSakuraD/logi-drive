"use client";

import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Gamepad2 } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="container flex flex-col justify-between items-center h-screen mt-56">
      <Link href="/test">
        <Label
          htmlFor="paypal"
          className="flex flex-col items-center font-semibold justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
        >
          <Gamepad2 className="mb-3 w-36 h-36" strokeWidth={1.5} />
          Logitech G923
        </Label>
      </Link>
    </div>
  );
}

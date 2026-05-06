"use client";
// PROTOTYPE — wires variants to the ?variant= search param

import { useSearchParams } from "next/navigation";
import { VariantA } from "./VariantA";
import { VariantB } from "./VariantB";
import { VariantC } from "./VariantC";
import { PrototypeSwitcher } from "./PrototypeSwitcher";

export function PrototypeLayoutInner() {
  const searchParams = useSearchParams();
  const variant = searchParams.get("variant") ?? "A";

  return (
    <>
      {variant === "A" && <VariantA />}
      {variant === "B" && <VariantB />}
      {variant === "C" && <VariantC />}
      <PrototypeSwitcher current={variant} />
    </>
  );
}

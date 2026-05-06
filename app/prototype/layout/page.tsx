// PROTOTYPE — throwaway. Delete after picking a layout direction.
// Question: Which main layout feels right for Kairos?
// Variants: A = Command Centre, B = Split View, C = Timeline
// Run: npm run dev → http://localhost:3000/prototype/layout

import { Suspense } from "react";
import { PrototypeLayoutInner } from "./PrototypeLayoutInner";

export default function PrototypeLayoutPage() {
  return (
    <Suspense>
      <PrototypeLayoutInner />
    </Suspense>
  );
}

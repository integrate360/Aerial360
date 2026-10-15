import assert from "node:assert/strict";

import { parseSlotDateTime } from "./slotDateTime.js";

{
  const m = parseSlotDateTime("21-04-2026", "18:30", 330);
  assert.equal(m.isValid(), true);
  assert.equal(m.format("DD-MM-YYYY HH:mm"), "21-04-2026 18:30");
  assert.equal(m.utcOffset(), 330);
}

{
  const m = parseSlotDateTime("21-04-2026", "6:30 PM", 330);
  assert.equal(m.isValid(), true);
  assert.equal(m.format("DD-MM-YYYY HH:mm"), "21-04-2026 18:30");
}

{
  const m = parseSlotDateTime("21-04-2026", "6:30PM", 330);
  assert.equal(m.isValid(), true);
  assert.equal(m.format("DD-MM-YYYY HH:mm"), "21-04-2026 18:30");
}

console.log("slotDateTime smoke tests passed");

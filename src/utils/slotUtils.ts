import { SlotStatus } from "../models/SlotStatus";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebaseconfig";

export async function updateSlotStatus(
  doctorId: string,
  date: string,
  time: string,
  status: SlotStatus
): Promise<void> {
  const slotKey = `${date}_${time}`;
  const docRef = doc(db, 'calendars', doctorId);
  switch (status) {
    case SlotStatus.Pending:
    case SlotStatus.Booked:
    case SlotStatus.Available:
      await updateDoc(docRef, {
        [`availability.${slotKey}`]: status,
      });
      break;
    default:
      throw new Error(`Invalid slot status: ${status}`);
  }
}

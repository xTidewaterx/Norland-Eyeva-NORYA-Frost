// src/app/api/syncPublicUsers/route.js
//import { db } from "@/lib/firebaseAdmin";

//import db from "..//../../firebase/firebaseConfig";
import {db} from "../../lib/firebaseAdmin";


export const runtime = "nodejs"; // ensures this runs server-side

export async function POST(req) {
  try {
    const usersSnapshot = await db.collection("users").get(); // db must not be undefined

    const promises = usersSnapshot.docs.map((userDoc) => {
      const userData = userDoc.data();
      const publicData = {
        username: userData.username || "",
        avatarUrl: userData.avatarUrl || "",
        bio: userData.bio || "",
        tag: userData.tag || "",
      };
      return db.collection("publicUsers").doc(userDoc.id).set(publicData, { merge: true });
    });

    await Promise.all(promises);

    return new Response(JSON.stringify({ message: "All users synced!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error syncing users:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

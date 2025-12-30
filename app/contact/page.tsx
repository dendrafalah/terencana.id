import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Terencana.id — Kontak",
  description: "Hubungi terencana.id via email atau WhatsApp.",
};

export default function ContactPage() {
  return <ContactClient />;
}

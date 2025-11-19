import axios from "axios";

export async function sendWhatsAppMessage(phone, message) {
  const apiKey = process.env.WHATSAPP_API_KEY; // la mettiamo dopo nel .env

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(
    message
  )}&apikey=${apiKey}`;

  try {
    await axios.get(url);
    return true;
  } catch (err) {
    console.error("WhatsApp error:", err);
    return false;
  }
}

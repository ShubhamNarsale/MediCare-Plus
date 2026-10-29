// services/aiService.js
// MediCare+ AI Assistant logic.
//
// Runs in a simple rule-based fallback mode by default (no external API
// required — matches the master prompt's requirement for the college
// project). If process.env.AI_API_KEY is ever set, callReal() is where a
// real AI API call would be added; getReply() already routes to it first,
// so no caller (aiController.js) needs to change when that happens.
//
// Every reply carries the required disclaimer. The assistant never claims
// to diagnose — the emergency/serious-symptom check below always wins
// over any keyword match, so a description of a serious symptom gets
// pointed at real help instead of an automated answer.

const DISCLAIMER =
  'MediCare+ AI Assistant provides general health information and website ' +
  'assistance. It does not diagnose diseases, prescribe medicines, or ' +
  'replace a qualified healthcare professional.';

const EMERGENCY_KEYWORDS = [
  'chest pain', 'can\'t breathe', 'cannot breathe', 'difficulty breathing',
  'severe bleeding', 'heavy bleeding', 'unconscious', 'suicide', 'overdose',
  'heart attack', 'stroke', 'severe pain', 'not breathing', 'seizure'
];

// [keywords to match in the user's message, reply text]
const RULES = [
  [['book appointment', 'book an appointment', 'schedule appointment', 'how to book'],
    'You can book an appointment by going to "Doctors", choosing a doctor, and clicking "Book Appointment" on their profile — or go straight to /doctors to browse by specialization.'],
  [['cancel appointment', 'cancel my appointment'],
    'To cancel an appointment, go to "My Appointments" from your dashboard and click "Cancel" next to the appointment you no longer need.'],
  [['my orders', 'order history', 'see my orders', 'track order'],
    'Your past orders are listed under "Order History" in your patient dashboard.'],
  [['skin', 'dermat', 'acne', 'rash'],
    'Skin-related concerns are handled by our Dermatology department. You can find and book a dermatologist from the Doctors page.'],
  [['heart', 'cardio', 'chest'],
    'Heart-related concerns are handled by our Cardiology department. You can find and book a cardiologist from the Doctors page.'],
  [['child', 'kid', 'baby', 'pediatric'],
    'Children\'s health is handled by our Pediatrics department — you can find a pediatrician on the Doctors page.'],
  [['tooth', 'teeth', 'dental'],
    'Dental concerns are handled by our Dentistry department — you can find a dentist on the Doctors page.'],
  [['eye', 'vision', 'ophthalm'],
    'Eye-related concerns are handled by our Ophthalmology department — you can find an eye specialist on the Doctors page.'],
  [['cart', 'checkout', 'buy product'],
    'You can add healthcare products to your cart from the Products page, then go to your Cart to review items and Checkout.'],
  [['contact', 'phone number', 'address', 'reach you'],
    'Our contact details, including address and phone number, are on the Hospital > Contact page.'],
  [['emergency', 'urgent'],
    'For a medical emergency, please go to the Hospital > Emergency page for our emergency contact number, or contact your local emergency services immediately.'],
  [['department', 'specializ'],
    'You can see all our departments — Cardiology, Dermatology, Neurology, Orthopedics, Pediatrics, ENT, General Medicine, Gynecology, Dentistry, and Ophthalmology — on the Hospital > Departments page.']
];

function containsAny(message, keywords) {
  return keywords.some((kw) => message.includes(kw));
}

function ruleBasedReply(rawMessage) {
  const message = rawMessage.toLowerCase().trim();

  if (containsAny(message, EMERGENCY_KEYWORDS)) {
    return 'This sounds like it could be serious. Please contact a qualified healthcare professional or your local emergency services right away — I\'m not able to assess or diagnose symptoms. You can find our emergency contact number on the Hospital > Emergency page.';
  }

  for (const [keywords, reply] of RULES) {
    if (containsAny(message, keywords)) {
      return reply;
    }
  }

  return 'I can help you find your way around MediCare+ — try asking about booking appointments, cancelling appointments, finding a department, or your order history. For medical concerns, I can only share general information; please consult a qualified healthcare professional for anything specific to you.';
}

// eslint-disable-next-line no-unused-vars
async function callReal(message) {
  // Placeholder for a real AI API integration. Read the key from the
  // environment — never hardcode it — and only attempt this if it's set.
  //   const apiKey = process.env.AI_API_KEY;
  //   ... call the provider's API here, return its reply text ...
  throw new Error('Real AI API is not configured.');
}

async function getReply(message) {
  if (!message || !message.trim()) {
    return { reply: 'Please type a question and I\'ll do my best to help.', disclaimer: DISCLAIMER };
  }

  if (process.env.AI_API_KEY) {
    try {
      const reply = await callReal(message);
      return { reply, disclaimer: DISCLAIMER };
    } catch (err) {
      // Fall back to rule-based mode if the real API isn't reachable/configured.
      return { reply: ruleBasedReply(message), disclaimer: DISCLAIMER };
    }
  }

  return { reply: ruleBasedReply(message), disclaimer: DISCLAIMER };
}

module.exports = { getReply, DISCLAIMER };

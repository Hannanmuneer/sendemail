const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
require("dotenv").config();

const app = express();


app.use(express.json());

const allowedOrigins = [
  "https://screenshot-to-pixel-perfect-180.vercel.app" // trailing slash hata dena zyadatar behtar hota hai CORS ke liye
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman ya server-to-server requests ke liye jahan origin nahi hota
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error("CORS policy violation"), false);
    }
    return callback(null, true);
  },
}));

// Nodemailer Transporter (Gmail ya koi bhi SMTP)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Tumhara personal Gmail
    pass: process.env.EMAIL_PASS, // Gmail ka App Password (yeh normal password nahi hota)
  },
});

// Contact Route
app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER, // Jis email pe message mangwana hai
      subject: `Portfolio Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h3>New Portfolio Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.status(200).json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
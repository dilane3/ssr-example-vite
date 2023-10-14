// app/ssr.js

module.exports = (req, res) => {
  res.status(200).json({ message: 'Hello from the Vercel function!' });
};

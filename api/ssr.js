// app/ssr.js

export default (req, res) => {
  res.status(200).json({ message: 'Hello from the Vercel function!' });
};

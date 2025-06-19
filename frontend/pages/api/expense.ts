export default function handler(req, res) {
  if (req.method === 'POST') {
    const fakeResponse = {
      ...req.body,
      id: Math.floor(Math.random() * 10000),  // simulate unique ID
      //date: "May 30, 18:00"      // add timestamp
      // month: "June",                          // mock month
      // icon: "DollarSign",                     // mock icon key
    };

    return res.status(200).json(fakeResponse);
  }

  res.status(405).json({ message: "Method not allowed" });
}
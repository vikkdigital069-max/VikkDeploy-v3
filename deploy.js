let lastDeployTime = 0;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const now = Date.now();

  if (now - lastDeployTime < 60000) {
    const sisa = Math.ceil((60000 - (now - lastDeployTime)) / 1000);
    return res.status(429).json({
      error: `Tunggu ${sisa} detik sebelum deploy lagi`
    });
  }

  const { projectName, htmlCode } = req.body;
  const apiKey = process.env.VERCEL_API_KEY;

  try {
    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: projectName,
        files: [
          { file: "index.html", data: htmlCode }
        ],
        projectSettings: { framework: null }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ error: data.error?.message });
    }

    lastDeployTime = Date.now();

    res.json({
      url: "https://" + data.url
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
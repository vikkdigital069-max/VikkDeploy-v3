let lastDeployTime = 0;

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = process.env.VERCEL_API_KEY;

    if (!token) {
      return res.status(500).json({ error: "ENV VERCEL_API_KEY tidak terbaca" });
    }

    const now = Date.now();

    // 🔥 RATE LIMIT 1 MENIT
    if (now - lastDeployTime < 60000) {
      const sisa = Math.ceil((60000 - (now - lastDeployTime)) / 1000);
      return res.status(429).json({
        error: `Tunggu ${sisa} detik sebelum deploy lagi`
      });
    }

    const { projectName, htmlCode } = req.body || {};

    if (!projectName || !htmlCode) {
      return res.status(400).json({
        error: "Project name atau HTML kosong"
      });
    }

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: projectName.toLowerCase(),
        files: [
          {
            file: "index.html",
            data: htmlCode
          }
        ],
        projectSettings: {
          framework: null
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data
      });
    }

    // update waktu deploy terakhir
    lastDeployTime = now;

    return res.status(200).json({
      url: "https://" + data.url
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}

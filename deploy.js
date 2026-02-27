export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = process.env.VERCEL_API_KEY;

    if (!token) {
      return res.status(500).json({ error: "Token tidak terbaca" });
    }

    const { projectName, htmlCode } = req.body;

    if (!projectName || !htmlCode) {
      return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const response = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: projectName.toLowerCase(),
        files: [
          {
            file: "index.html",
            data: htmlCode,
          },
        ],
        projectSettings: {
          framework: null,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "Deploy gagal" });
    }

    return res.status(200).json({
      url: `https://${data.url}`,
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

import axios from "axios";
import * as cheerio from "cheerio";

// Link preview controller
export const getLinkPreview = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL is required" });
    }

    // Validate URL
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({ message: "Invalid URL format" });
    }

    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  $('title').text() || 
                  $('h1').first().text();

    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || 
                       $('p').first().text();

    const image = $('meta[property="og:image"]').attr('content') || 
                  $('meta[name="twitter:image"]').attr('content') || 
                  $('meta[name="image"]').attr('content');

    const siteName = $('meta[property="og:site_name"]').attr('content') || 
                     $('meta[name="application-name"]').attr('content') || 
                     new URL(url).hostname;

    // Clean up description
    const cleanDescription = description ? 
      description.replace(/\s+/g, ' ').trim().substring(0, 200) + (description.length > 200 ? '...' : '') : 
      '';

    res.status(200).json({
      title: title ? title.trim() : '',
      description: cleanDescription,
      image: image || '',
      siteName: siteName ? siteName.trim() : '',
      url: url
    });

  } catch (error) {
    console.error("Error fetching link preview:", error);
    
    // Handle specific error cases
    if (error.code === 'ENOTFOUND') {
      return res.status(404).json({ error: "Website not found" });
    }
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ error: "Website is not accessible" });
    }
    
    if (error.code === 'ETIMEDOUT') {
      return res.status(408).json({ error: "Request timeout" });
    }

    res.status(500).json({ 
      error: "Failed to fetch link preview",
      details: error.message 
    });
  }
};

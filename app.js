require("dotenv").config();
const path = require("path");
const express = require("express");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "./public");

app.get("/", (req, res) => {
  res.render("index.ejs", { result: "" });
});

app.post("/", async (req, res) => {
  const prompt = req.body.prompt;
  const snippetType = req.body["snippet-type"];
  console.log(prompt);

  try {
    const result = await generateBlogPost(prompt, snippetType);
    res.render("index.ejs", { result: result });
  } catch (error) {
    console.error("Error generating blog post:", error);
    res.status(500).send("An error occurred while generating the blog post.");
  }
});

const generateBlogPost = async (prompt, snippetType) => {
  try {
    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: `
        Buatkan sebuah blog tentang ${prompt}
        Terdiri dari pembuka, isi konten, dan penutup
        Isinya harus SEO-friendly agar mendapatkan featured snippet ${snippetType}.
        Buatkan dalam format HTML, setiap point penting ditebalkan dan diberi baris baru
      `,
      max_tokens: 4000,
    });

    console.log(response.choices);
    return response.choices[0].text.trim();
  } catch (error) {
    throw error;
  }
};

module.exports = app;

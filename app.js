require("dotenv").config();
const path = require("path");
const express = require("express");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")));
app.set("views", "./public");

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/generate-content", async (req, res) => {
  const { prompt, snippet } = req.body
  console.log(prompt, snippet)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // hit api;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": `
      Buatkan sebuah blog tentang ${prompt}
      Terdiri dari pembuka, isi konten, dan penutup
      Isinya harus SEO-friendly agar mendapatkan featured snippet ${snippet}.
      Buatkan dalam format HTML dan gunakan class tailwind langsung, setiap point penting ditebalkan.
    ` }
    ],
    temperature: 0,
    stream: true,
  });

  try {
    for await (const chunk of completion) {
      const result = chunk.choices[0].delta.content;
      if (result) {
        res.write(result)
      }
    }

  } catch (error) {
    console.log(error)
    res.write("errorr generate prompt")
  }
});

// const generateBlogPost = async (prompt, snippetType) => {
//   try {
//     const response = await openai.completions.create({
//       model: "gpt-3.5-turbo-instruct",
//       prompt: `
//         Buatkan sebuah blog tentang ${prompt}
//         Terdiri dari pembuka, isi konten, dan penutup
//         Isinya harus SEO-friendly agar mendapatkan featured snippet ${snippetType}.
//         Buatkan dalam format HTML dan gunakan class tailwind langsung, setiap point penting ditebalkan.
//       `,
//       max_tokens: 4000,
//     });

//     console.log(response.choices);
//     return response.choices[0].text.trim();
//   } catch (error) {
//     throw error;
//   }
// };

module.exports = app;

const express = require("express");
const cors = require("cors");
const app = express();
const port = 8080;
require("dotenv").config();

const { default: OpenAI } = require("openai");
const openai = new OpenAI();

app.use(cors());
app.use(express.json());
app.post("/answer", async (req, res) => {
  try {
    console.log(req.body.question);
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [
        {
          role: "system",
          content: "Answer question.",
        },
        { role: "user", content: req.body.question },
      ],
      max_tokens: 50,
    });
    const answer = gptResponse.choices[0].message.content;
    res.status(200).json({ reply: answer });
  } catch (error) {
    // Handle errors and send an appropriate response
    console.error("Error creating family item:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

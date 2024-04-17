app.post("/answer", async (req, res) => {
  try {
    console.log(req.body.question);
    const question = req.body.question;
    console.log(question);
    const messages = [
      {
        role: "system",
        content: `
          Rephrase user message to the form in which it can be used in the search engine. 
          Make it the best search term for Google for given phrase.
          Make it as short as possible, use keywords only`,
      },
      { role: "user", content: question },
    ];
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: messages,
      max_tokens: 50,
    });
    const searchTerm = gptResponse.choices[0].message.content;
    const params = {
      q: searchTerm,
    };
    search.json(params, async function (data) {
      console.log(data);

      res.status(200).json({ reply: data["organic_results"][0].link });
    });
  } catch (error) {
    // Handle errors and send an appropriate response
    console.error("Error creating family item:", error);
    res.status(500).send("Internal Server Error");
  }
});

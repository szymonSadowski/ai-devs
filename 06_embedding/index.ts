import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";

type Embedding = {
  code: number;
  msg: string;
  hint1: string;
  hint2: string;
  hint3: string;
};

const phrase = "Hawaiian pizza";
const embedding = async () => {
  const data = await useTaskData<Embedding>("embedding");
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const embedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: phrase,
      encoding_format: "float",
    });
    const answer = {
      token: data?.token,
      answer: embedding.data[0].embedding,
    };
    await sendAnswer(answer);
    console.log(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

embedding();

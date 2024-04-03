import { ChatPromptTemplate } from "langchain/prompts";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";
import { ChatOpenAI } from "@langchain/openai";

type Scraper = TaskType & {
  question: string;
  input: string;
};

function fetchWithTimeout(url: string, timeout = 5000) {
  // Default timeout is 5000 ms
  return Promise.race([
    fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
    }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeout)
    ),
  ]);
}

async function fetchArticle(url: string) {
  let attempts = 0;
  while (true) {
    attempts++;
    try {
      const response = await fetchWithTimeout(url);
      //@ts-expect-error
      if (response.ok) {
        //@ts-expect-error
        const article = await response.text();
        return article;
      } else {
        //@ts-expect-error
        console.error(`Attempt ${attempts}: Server error ${response.status}`);
      }
    } catch (error) {
      //@ts-expect-error
      console.error(`Attempt ${attempts} failed with error: ${error.message}`);
    }
  }
}

const systemTemplate = `Message: {message} ###context {article}###`;
const humanTemplate = `Pytanie {question}`;
const chatPromptTemplate = ChatPromptTemplate.fromPromptMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);

const scraper = async () => {
  const data = await useTaskData<Scraper>("scraper");
  const chat = new ChatOpenAI();
  console.log(data);
  if (!data) return;
  try {
    const article = await fetchArticle(data.task.input);
    const message = data.task.msg;
    const question = data.task.question;
    const chatPrompt = await chatPromptTemplate.formatMessages({
      message,
      article,
      question,
    });
    const { content } = await chat.invoke(chatPrompt);
    console.log(content);
    const answer = {
      token: data?.token,
      answer: content,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

scraper();

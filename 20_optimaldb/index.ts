import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";
import { ChatPromptTemplate } from "langchain/prompts";
import { ChatOpenAI } from "@langchain/openai";

type Optimaldb = TaskType & {
  database: "https://tasks.aidevs.pl/data/3friends.json";
};

type DatabaseType = {
  [key: string]: Array<string>;
};
const humanTemplate = `Oto imie: {imie} a to tekst {db}`;

const systemTemplate = `Twoim celem jest zoptymalizowac dlugosc stringa. Zwroc teksty o podanych personach w skroconej formie, zachowujac pelne znaczenie. Uzywaj rownowaznikow zdan. Skup sie na zachowaniu wszystkich informacji.
  Zwrot powinien wygladac tak imie: skrocony tekst. np. Andrzej: Lubi lowic ryby.
  ###example
  Source: "Podczas studiów prawa, Ania zaangażowała się w organizację konferencji dotyczącej prawa autorskiego.",
  Result: Studiuje prawo. Zorganozowała konfernecję o prawie autorskim.
  ###`;

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);
const chat = new ChatOpenAI({ modelName: "gpt-4" });
const optimaldb = async () => {
  const data = await useTaskData<Optimaldb>("optimaldb");

  if (!data) return;
  const response = await fetch(data.task.database);
  const database = (await response.json()) as DatabaseType;
  let shortenedTexts = "";
  for (const name of Object.keys(database)) {
    const chatPrompt = await chatPromptTemplate.formatMessages({
      imie: name,
      db: database[name],
    });
    const { content } = await chat.invoke(chatPrompt);
    shortenedTexts += `${content}  `;
  }
  const answer = {
    token: data?.token,
    answer: shortenedTexts,
  };
  await sendAnswer(answer);
  try {
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

optimaldb();

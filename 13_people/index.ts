import { ChatOpenAI } from "@langchain/openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";
import { ChatPromptTemplate } from "langchain/prompts";

type People = TaskType & {
  data: string;
  question: string;
  hint1: string;
  hint2: string;
};

type Person = {
  imie: string;
  nazwisko: string;
};
type ResultType = Person & {
  wiek: number;
  o_mnie: string;
  ulubiona_postac_z_kapitana_bomby: string;
  ulubiony_serial: string;
  ulubiony_film: string;
  ulubiony_kolor: string;
};
const systemTemplate = `Odpowiedz na pytanie uzytkownika tylko na podstawie dostępnych danych.

###Context {context}`;

const humanTemplate = `Pytanie {question}`;

const nameTemplate = `Z podanego pytania: 
- wyciągnij "imię" i "nazwisko" osoby
- jeśli imię jest zdrobnieniem, zmień na forme podstawową
- podaj wynik w formie JSON i NIC WIĘCEJ

Przykład:

Q: Jaka jest ulubiona potrawa Lecha Wałęsy
A: {{ "imie": "Lech", "nazwisko": "Wałęsa" }}

Q: Gdzie mieszka Krysia Krawczyk?
A: {{ "imie": "Krystyna", "nazwisko": "Krawczyk" }}
`;

const chatPromptTemplateName = ChatPromptTemplate.fromMessages([
  ["system", nameTemplate],
  ["human", humanTemplate],
]);

const chatPromptTemplate = ChatPromptTemplate.fromMessages([
  ["system", systemTemplate],
  ["human", humanTemplate],
]);
const people = async () => {
  const data = await useTaskData<People>("people");
  const chat = new ChatOpenAI();
  console.log(data);
  if (!data) return;
  try {
    const db = await fetch(data?.task.data);
    const result = (await db.json()) as Array<ResultType>;

    const chatPrompt = await chatPromptTemplateName.formatMessages({
      question: data.task.question,
    });
    const { content } = await chat.invoke(chatPrompt);
    // @ts-expect-error
    const personJson = JSON.parse(content) as Person;
    const filteredResults = result.filter((person) => {
      return (
        person.imie === personJson.imie &&
        person.nazwisko === personJson.nazwisko
      );
    });

    const context = `Imie: ${filteredResults[0].imie}, 
    Nazwisko: ${filteredResults[0].nazwisko}. Wiek :${filteredResults[0].nazwisko}. 
    O mnie: ${filteredResults[0].o_mnie},
    Ulubiona postac z serialu Kapitan Bomba to ${filteredResults[0].ulubiona_postac_z_kapitana_bomby},
    Ulubiony Serial to :${filteredResults[0].ulubiony_serial},
    Ulubiony Film to :${filteredResults[0].ulubiony_film},
    Moj ulubiony kolor to: ${filteredResults[0].ulubiony_kolor}
    `;

    const chatPromptAnswer = await chatPromptTemplate.formatMessages({
      question: data.task.question,
      context,
    });
    const questionAnswered = await chat.invoke(chatPromptAnswer);
    console.log(questionAnswered.content);

    const answer = {
      token: data?.token,
      answer: questionAnswered.content,
    };
    await sendAnswer(answer);
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

people();

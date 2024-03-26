import { ChatOpenAI } from "@langchain/openai";
import { sendAnswer, sendTaskData, useSendTaskData, useTaskData } from "../lib";
import { PromptTemplate } from "langchain/prompts";

type Inprompt = {
  code: number;
  msg: string;
  input: Array<string>;
  question: string;
};

type FilterNameProps = {
  array: Array<string>;
  name: string;
};
function filterNames({ array, name }: FilterNameProps) {
  const fillteredArray = array.filter((string) =>
    string.toLowerCase().includes(name.toLowerCase())
  );
  return fillteredArray.join(" ");
}

const inprompt = async () => {
  const data = await useTaskData<Inprompt>("inprompt");
  try {
    const model = new ChatOpenAI({ modelName: "gpt-4" });
    const questionPrompt = `return name of the person mentioned in question 
      ### question
      ${data?.task.question}
      ###
      `;

    const modelResponse = await model.invoke(questionPrompt);
    const person = modelResponse.content;
    const props = {
      name: person as string,
      array: data!.task.input,
    };
    const filteredSentences = filterNames(props);

    const promptTemplate = PromptTemplate.fromTemplate(
      `Answer question about ${person} based on context. Return only answer.
      ###CONTEXT
      {context}
      ###`
    );
    const chain = promptTemplate.pipe(model);
    const answerQuestion = await chain.invoke({ context: filteredSentences });

    const answer = {
      token: data?.token,
      answer: answerQuestion.content,
    };
    await sendAnswer(answer);
    console.log(answer);
  } catch (error) {
    console.error("Something went wrong");
  }
};

inprompt();

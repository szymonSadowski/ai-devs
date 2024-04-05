import OpenAI from "openai";
import { sendAnswer, useTaskData } from "../lib";
import type { TaskType } from "../lib/types";
import { supabase } from "./db";

type Search = TaskType & {
  question: string;
};

type Result = {
  id: number;
};
type SearchResult = {
  result: Array<Result>;
};
const qdrantUrl = process.env.QDRANT_URL + "/collections/news";
const openai = new OpenAI();
const qdrant = async () => {
  const response = await fetch(qdrantUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vectors: {
        size: 1536,
        distance: "Cosine",
      },
    }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const init = await response.text();
  console.log(init);
  console.log(response);
};

async function insertEmbededRecords() {
  console.log("performing embedding...");
  const { data, error } = await supabase.from("news").select();
  if (error) return;
  const array = [];
  for (let i = 0; i < data.length; i++) {
    console.log(`record ${i} of ${data.length} `);
    const { id, title, url, info, date } = data[i];
    const embed = `${title}
    ${info}`;

    const embeddings = await openai.embeddings.create({
      input: embed,
      model: "text-embedding-ada-002",
    });
    console.log(embeddings.data[0].embedding);
    array.push({
      id: id,
      vector: embeddings.data[0].embedding,
      payload: { embed: embed },
    });
  }
  console.log(array, array.length);
  const response = await fetch(`${qdrantUrl}/points?wait=true`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ points: array }),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  console.log(response);

  return 0;
}

const search = async () => {
  const data = await useTaskData<Search>("search");
  console.log(data);
  //create colletcion and add embeddings there
  // await qdrant();
  // await insertEmbededRecords();
  if (!data) return;
  try {
    const searchUrl = `${qdrantUrl}/points/search`;
    const embeddings = await openai.embeddings.create({
      input: data.task.question,
      model: "text-embedding-ada-002",
    });

    const response = await fetch(searchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        params: {
          hnsw_ef: 128,
          exact: false,
        },
        vector: embeddings.data[0].embedding,
        limit: 1,
        with_payload: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const search = (await response.json()) as SearchResult;

    const record = await supabase
      .from("news")
      .select()
      .eq("id", search.result[0].id);

    if (record.data !== null) {
      const answer = {
        token: data?.token,
        answer: record.data[0].url,
      };
      await sendAnswer(answer);
    } else return 0;
  } catch (error) {
    console.error("Something went wrong", error);
  }
};

search();

// Run this server with cmd "node index_embeddings.js" from root directory.
// Ensure you have values for AIRTABLE_BASE_ID and AIRTABLE_API_KEY environment variables in .env.
// Airtable base name used in this example is "Frontend Fresh" and Airtable view is "Grid view".

require("dotenv").config();
const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const Airtable = require("airtable");

const app = express();
app.use(express.json());

// airtable configuration
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
}).base(process.env.AIRTABLE_BASE_ID);
const airtableTable = airtableBase("Frontend Fresh");
const airtableView = airtableTable.select({ view: "Grid view" });

// open ai configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const port = process.env.PORT || 5000;

// constants
const COMPLETIONS_MODEL = "text-davinci-003";
const EMBEDDING_MODEL = "text-embedding-ada-002";

// functions
// ---
function cosineSimilarity(A, B) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < A.length; i++) {
    dotProduct += A[i] * B[i];
    normA += A[i] * A[i];
    normB += B[i] * B[i];
  }
  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);
  return dotProduct / (normA * normB);
}

function getSimilarityScore(embeddingsHash, promptEmbedding) {
  const similarityScoreHash = {};
  Object.keys(embeddingsHash).forEach((text) => {
    similarityScoreHash[text] = cosineSimilarity(
      promptEmbedding,
      JSON.parse(embeddingsHash[text])
    );
  });
  return similarityScoreHash;
}

function getAirtableData() {
  return new Promise((resolve, reject) => {
    airtableView.firstPage((error, records) => {
      if (error) {
        console.log(error);
        return reject({});
      }
      const recordsHash = {};
      records.forEach(
        (record) => (recordsHash[record.get("Text")] = record.get("Embedding"))
      );
      resolve(recordsHash);
    });
  });
}
// ---

app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;

  try {
    if (prompt == null) {
      throw new Error("Uh oh, no prompt was provided");
    }

    // getting text and embeddings data from airtable
    const embeddingsHash = await getAirtableData();
    // get embeddings value for prompt question
    const promptEmbeddingsResponse = await openai.createEmbedding({
      model: EMBEDDING_MODEL,
      input: prompt,
      max_tokens: 64,
    });
    const promptEmbedding = promptEmbeddingsResponse.data.data[0].embedding;

    // create map of text against similarity score
    const similarityScoreHash = getSimilarityScore(
      embeddingsHash,
      promptEmbedding
    );

    // get text (i.e. key) from score map that has highest similarity score
    const textWithHighestScore = Object.keys(similarityScoreHash).reduce(
      (a, b) => (similarityScoreHash[a] > similarityScoreHash[b] ? a : b)
    );

    // build final prompt
    const finalPrompt = `
      Info: ${textWithHighestScore}
      Question: ${prompt}
      Answer:
    `;

    const response = await openai.createCompletion({
      model: COMPLETIONS_MODEL,
      prompt: finalPrompt,
      max_tokens: 64,
    });

    const completion = response.data.choices[0].text;

    return res.status(200).json({
      success: true,
      message: completion,
    });
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => console.log(`Server is running on port ${port}!!`));

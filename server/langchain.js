const fs = require("fs");
const express = require("express");
const { NodeHtmlMarkdown } = require("node-html-markdown");

const { initializeAgentExecutor } = require("langchain/agents");
const { ChainTool } = require("langchain/tools");
const { VectorDBQAChain } = require("langchain/chains");
const { HNSWLib } = require("langchain/vectorstores");
const { OpenAIEmbeddings } = require("langchain/embeddings");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { ChatOpenAI } = require("langchain/chat_models");
const { BufferMemory } = require("langchain/memory");
const {
  HumanChatMessage,
  SystemChatMessage,
  AIChatMessage,
} = require("langchain/schema");

var executor;
var openAIApiKey;
var chatMessages;
const router = express.Router();
const nhm = new NodeHtmlMarkdown({}, undefined, undefined);

router.post("/setup", async (req, res) => {
  console.log("Setup");
  //fs.writeFileSync("docText.html", req.body.docText.html);

  var htmlText = nhm.translate(req.body.docText.html);
  fs.writeFileSync("docText.md", htmlText);

  await setupLLM(htmlText);
  //write docText in req to file
  res.json({ message: "Server setup." });
});

router.post("/chat", async (req, res) => {
  console.log("Chat");
  var answer = await queryLLM(req.body.query);
  res.json({ message: "Chat posted.", answer: answer });
});

router.get("/clear", async (req, res) => {
  console.log("Clear");
  clearChat();
  res.json({ message: "Chat cleared." });
})

router.get("/chatHistory", (req, res) => {
  console.log("Chat history");
  //filter out system message in chatMessages and map the rest into the format - [{"user": "hello"}, {"chatbot": "hello, how can I help you?"}]
  var chatHistory = chatMessages.filter((message) => message._getType() != "system").map((message) => {
    if (message._getType() == "human") {
      return { user: message.text };
    } else if (message._getType() == "ai") {
      return { chatbot: message.text };
    }
  })
  res.json({ message: "Chat history retrieved.", chatHistory: chatHistory });
});

router.post("/setupAPIKey", (req, res) => {
  console.log("Setup openai key");
  loadOpenAIAPIKey(req.body.APIKey);
})

async function loadOpenAIAPIKey(key) {
  openAIApiKey = key;
}

async function setupLLM(docText) {
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: openAIApiKey,
    temperature: 0.7,
  });
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 50,
  });
  const docs = await textSplitter.createDocuments([docText]);
  /* Create the vectorstore */
  const vectorStore = await HNSWLib.fromDocuments(
    docs,
    new OpenAIEmbeddings({
      openAIApiKey: openAIApiKey,
    })
  );
  /* Create the chain */
  const chain = VectorDBQAChain.fromLLM(model, vectorStore);

  const qaTool = new ChainTool({
    name: "webpage-qa",
    description: "You can query this tool with information you want, it will do a semantic search over the webpage for that information and return the relevant chunk of information.",
    chain: chain,
  });

  executor = await initializeAgentExecutor(
    [qaTool],
    model,
    "chat-conversational-react-description",
    verbose = true
  );
  executor.memory = new BufferMemory({
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
  });

  console.log("Loaded agent.");
}

async function queryLLM(query) {
  // const query = `Who is the hero of the movie?`;

  console.log(`Executing with input "${ query }"...`);
  chatMessages.push(new HumanChatMessage(query));

  const result = await executor.call({ input: query });

  console.log(`Got output ${ result.output }`);
  chatMessages.push(new AIChatMessage(result.output));

  return result.output;
}

let clearChat = () => {
  chatMessages = new Array(
    new SystemChatMessage(
      text = "You are a helpful, smart chatbot that has access to the content of a webpage via the webpage-qa tool. Answer the queries of your user by selecting the most relevant sentences from the webpage. If the query from user is ambiguous, it is mostly in reference with the webpage content, so query the webpage-qa tool requesting the information required to disambiguate the question. You can also ask questions to the user to get more information."
    ),
  )
};
clearChat();

module.exports = { router };

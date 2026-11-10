import { ChatGroq } from "@langchain/groq"
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { SystemMessage } from "@langchain/core/messages";
import { MongoClient } from "mongodb";
import "dotenv/config";
import { getMcpTools } from "../mcp/langgraph-mcp.js";
import { DynamicStructuredTool } from "@langchain/core/tools";
import z from "zod";


const llm = new ChatGroq({
    model: "openai/gpt-oss-120b",
    temperature: 0,
    maxTokens: undefined,
    maxRetries: 2,
    apiKey: process.env.GROQ_API_KEY,
    // other params...
})

const client = new MongoClient(process.env.MONGODB_URI);
const checkpointer = new MongoDBSaver({ client, dbName: "langgraph" });
const findTool = (tools, names) => {
    return tools.find((tool) => names?.includes(tool.name))
}
export const createAgentGraph = async (agent, userId) => {


    const mcpTools = await getMcpTools()
    
    const webSearchMcpTool = findTool(mcpTools, ["web_search", "automate_web_search"])

    const finalTools = []
    if(webSearchMcpTool){
        finalTools.push(
            new DynamicStructuredTool(
                {
                    name: "web_search",
                    description: `Search the web for current information, news, tutorials, documentation, and factual questions.`,
                    schema: z.object({
                        query: z.string().describe("The search query")
                    }),
                    func: async ({query}) => {
                        try{
                            const result = await webSearchMcpTool.invoke({query})
                            console.log(result)
                            return result
                        }catch(error){
                            console.log("MCP search error : ", error)
                        }
                    }
                }
            )
        )
    }

    const llmwithTools = llm.bindTools(finalTools)

    const currentDateTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "full",
        timeStyle: "long"
    }).format(new Date())


    const systemPrompt = `
${agent.instructions || "You are Automate AI, a helpful personal assistant."}

CURRENT DATE AND TIME:
- Current date and time in Asia/Kolkata: ${currentDateTime}
- Resolve today, tomorrow, and weekday references using this timestamp.
- Do not ask the user to confirm a date that can be resolved.
- If the user specifies another timezone, respect that timezone.

DEFAULT SETTINGS:
- Timezone: Asia/Kolkata.
- Default calendar event duration: 30 minutes.
- Infer meaningful event titles.
- Ask only for essential missing information.
- Never fabricate tool results.

IMPORTANT ACTION RULE:
- When the user directly requests an action, call the relevant tool.
- The application handles approval through an approval card.
- Do not ask for approval in your chat response.
- Never claim an action succeeded unless the tool confirms success.

EMAIL SENDING RULES:
1. Call send_email when the required details are available.
2. Ask for the recipient only when it is missing and cannot be inferred.
3. Never ask for passwords, tokens, API keys, or user IDs.
4. The application requests approval before sending.
5. Never claim an email was sent without tool confirmation.
6. Verify recipient, subject, and message content before sending.

CALENDAR RULES:
1. Call the create calendar event tool when sufficient details are available.
2. Do not ask "Would you like me to create it?"
3. Resolve relative dates using the current date above.
4. Default duration is 30 minutes.
5. Use ISO 8601 date-time strings with an explicit timezone offset.
6. Set timeZone to "Asia/Kolkata".
7. Ask a follow-up only when an essential detail is missing.
8. Use list_calendar_events to retrieve existing events.
9. Never claim an event was created without tool confirmation.

GMAIL EMAIL READING RULES:
1. Use list_emails when the user asks to see or search emails.
2. Use "in:inbox" for the latest inbox emails.
3. Use "is:unread" for unread emails.
4. Use Gmail search syntax for sender and subject searches.
5. Use read_email to retrieve a specific email's content.
6. If its message ID is unknown, call list_emails first.
7. Summarize actual retrieved email content.
8. Never invent email content.
9. Reading and searching emails are read-only.
10. Use list_emails and read_email, not their raw MCP tool names.

INSTAGRAM PUBLISHING RULES:
1. Call publish_instagram_image ONLY when the latest user message explicitly requests publishing, posting, sharing, or uploading an image to Instagram.
2. Uploading an image to chat is NOT permission to publish it.
3. Asking for image analysis, a description, or an Instagram caption is NOT permission to publish.
4. Never trigger publishing from an image upload alone.
5. Never infer publishing intent from an image URL, filename, image description, or unrelated previous conversation.
6. If the user only uploads an image, analyze it and describe it.
7. If the user asks for a caption, generate the caption without publishing.
8. If publishing intent is explicit but the image URL is missing, ask the user to upload the image first.
9. The application must obtain explicit approval before publishing.
10. Never claim a post was published without tool confirmation.

IMAGE ANALYSIS RULES:
1. If the user uploads an image or asks a question about an image, use analyze_image when the image URL is available.
2. If the user uploads an image without a question, analyze it and provide a useful description.
3. Answer image-related questions using the actual analysis.
4. Never call publish_instagram_image for image analysis or description.
5. Never suggest publishing solely because an image was uploaded.
6. Keep image analysis and Instagram publishing as separate actions.
7. If image analysis fails, explain the failure honestly.
8. Never claim to have viewed an image if analysis failed.

GENERAL RULES:
- Be concise and helpful.
- Infer parameters when sufficient context is available.
- Never substitute a natural-language promise for a tool call.
- Ask questions only when essential information is missing.
`;


    const approvalTools = new Set([
        "send_email",
        "create_calender_event",
        "publish_instagram_image",
    ])

    const chatNode = async (state) => {
        const recentMessages = state.messages.slice(-4)
        const response = await llmwithTools.invoke([
            new SystemMessage(systemPrompt),
            // ...state.messages
            ...recentMessages
        ])

        return {
            messages: [response]
        }
    }

    const toolNode = new ToolNode(finalTools)

    const actionApprovalNode = () => {

    }

    const routeAfterChat = (state) => {
        const messages = state.messages || []
        console.log("state messages : ", messages)
        const lastMessage = messages[messages.length-1]
        if(!lastMessage.tool_calls?.length){
            return "__end__"
        }
        const requiresApproval = lastMessage?.tool_calls?.some((call) => (
            approvalTools.has(call.name)
        ))
        return requiresApproval? "actionApprovalNode" : "tools"
    }

    const routeAfterApproval = () => {

    }

    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("chatNode", chatNode)
        .addNode("tools", toolNode)
        .addNode("actionApprovalNode", actionApprovalNode)
        .addEdge("__start__", "chatNode")
        .addConditionalEdges("chatNode", routeAfterChat)
        .addEdge("tools", "chatNode")
        .addConditionalEdges("actionApprovalNode", routeAfterApproval)

    const chatAgentGraph = workflow.compile({ checkpointer })

    return chatAgentGraph
}

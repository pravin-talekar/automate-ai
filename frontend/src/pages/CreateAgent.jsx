import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createAgent } from "@/features/agent";
import { ArrowLeft, Bot, Check, Workflow } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const availableTools = [
    {
        id: "calculator",
        name: "Calculator",
        description: "Perform mathematical calculations"
    },
    {
        id: "web_search",
        name: "Web Search",
        description: "Search the web for real-time information"
    },
    {
        id: "weather",
        name: "Weather",
        description: "Get current weather and forecast information"
    },
    {
        id: "email",
        name: "Email",
        description: "Send and manage email messages"
    },
    {
        id: "database",
        name: "Database",
        description: "Store, retrieve, and manage data"
    }
];

const darkPanel = "border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
const fieldCls = "rounded-xl border-white/10 bg-white/[0.04] text-sm text-white backdrop-blur-xl placeholder:text-zinc-500 focus-visible:border-white/25 focus-visible:ring-0"

function CreateAgents() {

    const [name, setName] = useState("");
    const [instructions, setInstructions] = useState("");
    const [knowledgeBase, setKnowledgeBase] = useState("");
    const [tools, setTools] = useState([]);
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const toggleTool = (tool) => {
        setTools((prevTools) => {
            if (prevTools?.includes(tool)) {
                return prevTools?.filter((t) => t !== tool);
            } else {
                return [...prevTools, tool]
            }
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
       try{
         const result = await createAgent({
            name, knowledgeBase, instructions, tools
        })

        console.log(result)
        if(result?.response?.data?.message){
            console.log(result)
            setError(result?.response?.data?.message)
            setLoading(false);
            return
        }
        setLoading(false);
        navigate("/agents")
       }catch(error){
        console.log(error)
        setLoading(false);
       }
    }

    return (
        <div className="relative min-h-screen bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,#2b2f3a_0%,#191b21_55%,#121317_100%)] text-white">
            <div className="pointer-events-none absolute inset-0
        bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.35)_100%)]"
            />

            <div className="relative z-10">
                <header className="z-30 flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
                    <Link to={"/"} className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-lg bg-white text-zinc-900"><Workflow size={17} /></span>
                        <span className="text-sm font-medium tracking-tight">Automate AI</span>
                    </Link>

                    <Link to={"/"} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/10 hover:text-white">
                        <ArrowLeft size={14} />
                        <span>Back to chat</span>
                    </Link>
                </header>

                <main className="mx-auto w-full max-w-2xl px-5 pb-12 pt-10 sm:px-8 sm:pt-14">
                    <div className="mb-9">
                        <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-white text-zinc-900 shadow-[0_10px_40px_rgba(255,255,255,0.12)]">
                            <Bot size={24} />
                        </div>

                        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Create an agent</h1>

                        <p className="mt-2 text-sm text-zinc-500">
                            Configure your AI agent and define what it can do.
                        </p>
                    </div>

                    <form className={`space-y-7 rounded-3xl p-5 sm:p-7 ${darkPanel}`}>
                        <section className="space-y-5">
                            <div>
                                <label htmlFor="agent-name"
                                    className="mb-2 block text-xs font-medium text-zinc-300">
                                    Agent Name
                                </label>
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Research Assistant"
                                    maxLength={100}
                                    required
                                    className={`h-11 ${fieldCls}`}
                                />
                            </div>

                            <div>
                                <label htmlFor="instructions"
                                    className="mb-2 block text-xs font-medium text-zinc-300">
                                    Instructions
                                </label>
                                <Input
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    placeholder="Instructions"
                                    maxLength={100}
                                    required
                                    className={`h-11 ${fieldCls}`}
                                />
                            </div>

                            <div>
                                <label htmlFor="knowledgeBase"
                                    className="mb-2 block text-xs font-medium text-zinc-300">
                                    Knowledge Base
                                </label>
                                <Textarea
                                    value={knowledgeBase}
                                    onChange={(e) => setKnowledgeBase(e.target.value)}
                                    placeholder="You are helpful AI assistant. Your job is to..."
                                    required
                                    className={`min-h-40 resize-y leading-6 ${fieldCls}`}
                                />
                            </div>
                        </section>

                        <section>
                            <div className="mb-3">
                                <h2 className="text-xs font-medium text-zinc-300">
                                    Tools
                                </h2>

                                <p className="mt-1 text-xs text-zinc-500">
                                    Select the capabilities available to your agent.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-white/10">
                                {
                                    availableTools.map((t, index) => {
                                        const selected = tools?.includes(t.id);

                                        return (
                                            <button
                                                key={t.id}
                                                onClick={(e) => {e.preventDefault(); toggleTool(t.id)}}
                                                className={`flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left transition ${index !== 0 ? "border-t border-white/[0.08]" : ""} ${selected ? "bg-white/[0.09]" : "bg-white/[0.02] hover:bg-white/[0.05]"}`}>

                                                <div>
                                                    <p className="text-xs font-medium text-zinc-100">
                                                        {t.name}
                                                    </p>
                                                    <p className="mt-1 text-[11px] text-zinc-500">
                                                        {t.description}
                                                    </p>
                                                </div>

                                                <span className={`flex size-[18px] shrink-0 items-center justify-center rounded-md border ${selected ? "border-white bg-white text-zinc-900" : "border-white/20 text-transparent"}`}>
                                                    {selected && <Check size={12} />}
                                                </span>
                                            </button>
                                        )
                                    })
                                }
                            </div>
                        </section>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-xs text-red-300"
                            >
                                {error}
                            </p>
                        )}

                        <div className="flex items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
                            <Button
                                onClick={() => navigate("/")}
                                type="button"
                                variant="ghost"
                                className="rounded-xl text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                type="submit"
                                className="h-10 rounded-xl bg-white px-5 text-xs font-medium text-zinc-900 hover:bg-zinc-200"
                            >
                                {loading ? "Creating..." : "Create Agent"}
                            </Button>
                        </div>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default CreateAgents;
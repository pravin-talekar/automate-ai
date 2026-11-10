import api from "@/api"

export const createAgent = async ({name, knowledgeBase, instructions, tools}) => {
    try{
        const {data} = await api.post("/api/agent", {name, knowledgeBase, instructions, tools});
        return data;
    }catch(error){
        console.log(error);
        return error
    }
}

export const getAllAgents = async () => {
    try{
        const {data} = await api.get("/api/agent/all");
        return data;
    }catch(error){
        console.log(error);
    }
}

export const getAgentById = async (id) => {
    try{
        const {data} = await api.get(`/api/agent/${id}`);
        return data;
    }catch(error){
        console.log(error);
    }
}

export const deleteAgent = async (id) => {
    try{
        const {data} = await api.delete(`/api/agent/${id}`);
        return data;
    }catch(error){
        console.log(error);
    }
}
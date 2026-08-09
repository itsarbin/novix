import { tool } from "@langchain/core/tools";
import { z } from "zod";
import axios from "axios";


export const listFiles = tool(
    async (_, runtime) => {
        try {
            if (!runtime.context?.projectId) {
                throw new Error("projectId is missing");
            }
            const writer = runtime.writer
            if (!writer) {
                throw new Error("Writer is missing");
            }
            writer("listing files .....")
            console.log("=====================================");
            console.log(runtime.context.projectId);
            console.log("=====================================");
            console.log('using list files tool')
            console.log("=====================================");

            const url = `http://sandbox-service-${runtime.context.projectId}:3000/list-files`
            


            const response = await axios.get(url)

            writer("files listed successfully" + response.data.files.join(","))
            console.log("=====================================");
            console.log("response from list files tool", response.data);
            console.log("=====================================");

            return response.data.files
        } catch (err) {
            console.log("=====================================");
            console.log("error from list files tool", err);
            console.log("=====================================");
            throw new Error("Failed to list files: " + err.message)
        }

    },
    {
        name: "list_files",
        description: "List all the files in Project directory which is /workspace. It will return a list of files in the project directory. it is helpful for understanding what files are available to work with",
        schema: z.object({})
    }
)

export const readFiles = tool(
    async ({ files }, runtime) => {
        if (!runtime.context?.projectId) {
            throw new Error("projectId is missing");
        }
        const writer = runtime.writer
        writer("reading files " + files.join(","))
        console.log("=====================================");
        console.log('using read files tool', files)
        console.log("=====================================");

        const url = `http://sandbox-service-${runtime.context.projectId}:3000/read-files?files=` + files.join(",")

        const response = await axios.get(url)
        writer("files read successfully")

        console.log("=====================================");
        console.log("response from read files tool", response.data);
        console.log("=====================================");

        return response.data
    },
    {
        name: "read_files",
        description: "Read the content of all files requested in the query parameter 'files' and returns their content as a JSON string.",
        schema: z.object({
            files: z.array(z.string().describe("list of files to read. these should be files that were listed using list_files tool or created later."))
        })

    }
)

export const updateFiles = tool(
    async ({ files }, runtime) => {
        if (!runtime.context?.projectId) {
            throw new Error("projectId is missing");
        }
        const writer = runtime.writer
        writer("updating files " + files.map(f => f.file).join(","))
        console.log("=====================================");
        console.log('using update files tool', files)
        console.log("=====================================");

        const url = `http://sandbox-service-${runtime.context.projectId}:3000/update-files`

        const response = await axios.patch(url, {
            updates: files
        })
        

        writer("files updated successfully")
        console.log("=====================================");
        console.log("response from update files tool", response.data);
        console.log("=====================================");

        return response.data
    },
    {
        name: "update_files",
        description: "Update or create one or more files. Each file object must contain the complete new content of the file.",
        schema: z.object(
            {
                files: z.array(z.object({
                    file: z.string().describe('The file path to update or create. If the file does not exist, it will be created. If it exists, it will be updated with the new content.'),
                    content: z.string().describe('The new content for the file, the content should support json format.')
                },

                )),

            }
        )
    }
)

import axios from 'axios';
import {tool} from 'langchain';
import * as z from 'zod';

export const listFiles = tool(
    async ({}) => {
        console.log("=====================================");
        console.log('using list files tool')
        console.log("=====================================");

        const response = await axios.get("http://019fb498-2eac-71a5-9e6c-a065e37eebbe.agent.localhost/list-files")

        console.log("=====================================");
        console.log("response from list files tool", response.data);
        console.log("=====================================");

        return JSON.stringify(response.data.files)
    },
    {
        name: "list_files",
        description: "List all the files in Project directory which is /workspace. It will return a list of files in the project directory. it is helpful for understanding what files are available to work with",
        schema: z.object({}),
    }
)

export const readFiles = tool(
   async ({files})=>{
    console.log("=====================================");
    console.log('using read files tool', files)
    console.log("=====================================");
    
    const response = await axios.get("http://019fb498-2eac-71a5-9e6c-a065e37eebbe.agent.localhost/read-files?files=" + files.join(","))
  
    console.log("=====================================");
    console.log("response from read files tool", response.data);
    console.log("=====================================");

    return JSON.stringify(response.data)
   },
   {
    name: "read_files",
    description: "Read the content of all files requested in the query parameter 'files' and returns their content as a JSON object.",
    schema: z.object({
        files: z.array(z.string().describe("list of files to read. these should be files that were listed using list_files tool or created later.")) 
    })
   }
)

export const updateFiles = tool(
    async({file, content})=>{
        console.log("=====================================");
        console.log('using update files tool', file)
        console.log("=====================================");
        const response = await axios.patch("http://019fb498-2eac-71a5-9e6c-a065e37eebbe.agent.localhost/update-files", {
            updates:[
                {
                    file,
                    content
                }
            ]
        })
        console.log("=====================================");
        console.log("response from update files tool", response.data);
        console.log("=====================================");

        return JSON.stringify(response.data.results)
    },
    {
        name: "update_and_create_files",
        description: "Updates an existing file or creates a new one if it does not exist. Takes a file path and the complete content to write into the file. Existing content will be overwritten.",
        schema: z.object({
            file: z.string().describe("The file path to update or create. If the file does not exist, it will be created. If it exists, it will be updated with the new content."),
            content: z.string().describe("The new content for the file. If the file exists, its content will be replaced with this new content. If the file does not exist, it will be created with this content.")
        }).describe("An object containing the file path and the new content for the file. If the file does not exist, it will be created. If it exists, it will be updated with the new content.")

    }
)
import { FastMCP } from "fastmcp";
import axios from "axios";
import { z } from "zod";

// Initialize FastMCP server
const server = new FastMCP({
  name: "common-metadata-repository",
  version: "1.0.0"
});

// DatasetSummary schema
const DatasetSummarySchema = z.object({
  concept_id: z.string(),
  title: z.string(),
  abstract: z.string()
});

/**
 * Format a single dataset record from CMR API response
 * @param {Object} dataset - A dataset object from CMR API
 * @returns {Object} Formatted dataset summary
 */
function formatDataset(dataset) {
  return {
    concept_id: dataset.id,
    title: dataset.title,
    abstract: dataset.summary
  };
}

// Add the get_collections tool
server.addTool({
  name: "get_collections",
  description: "Search NASA's Common Metadata Repository (CMR) collection records using full text search.",
  parameters: z.object({
    keyword: z.string().optional().default("")
  }),
  execute: async (args) => {
    try {
      const { keyword } = args;
      
      // Build CMR API URL
      const baseUrl = "https://cmr.earthdata.nasa.gov/search/collections.json";
      const params = new URLSearchParams();
      
      // Add keyword parameter if provided
      if (keyword && keyword.trim()) {
        params.append("keyword", keyword.trim());
      }
      
      // Limit results to 5 (same as Python version)
      params.append("page_size", "5");
      
      const url = `${baseUrl}?${params.toString()}`;
      
      // Make request to CMR API
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'User-Agent': 'fastmcp-node/1.0.0'
        }
      });
      
      const data = response.data;
      const collections = data.feed?.entry || [];
      
      // Format the results
      const formattedCollections = collections.map(formatDataset);

      return JSON.stringify(formattedCollections);
      
    } catch (error) {
      console.error("Error searching CMR collections:", error.message);
      
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      
      throw new Error(`Failed to search CMR collections: ${error.message}`);
    }
  }
});

server.start({
  transportType: "httpStream",
  httpStream: {
    port: 5001,
    host: "127.0.0.1",
    endpoint: "/mcp",
    stateless: true
  }
});
import earthaccess
import logging
import traceback
import uvicorn

from fastmcp import FastMCP
from pydantic import BaseModel

from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware

from typing import Any,  Optional
from typing import Optional

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.DEBUG)

# Initialize FastMCP server
mcp = FastMCP("common-metadata-repository")

# Add CORS so browsers/inspector can preflight with OPTIONS
cors = Middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:6274",  # MCP Inspector
        "http://localhost:6274",
        "http://localhost:3000",  # Web UI
        "http://127.0.0.1:3000",
    ],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Mcp-Session-Id"],
)

# Build the app with middleware and the intended path
app = mcp.http_app(path="/mcp", middleware=[cors])

class DatasetSummary(BaseModel):
    concept_id: str
    title: str
    abstract: str

def format_dataset(dataset) -> dict:
    """Format a single dataset record to return to the tool
    
    Args:
        dataset: A DatasetSummary object from earthaccess
    """
    return DatasetSummary(
        concept_id=dataset.concept_id(),
        title=dataset.get_umm("EntryTitle"),
        abstract=dataset.get_umm("Abstract")
    )

@mcp.tool(
    name="get_collections",
    description="Search NASA's Common Metadata Repository (CMR) collection records using full text search.",
    tags={"search"}
)
async def get_collections(keyword: str = '') -> list[DatasetSummary]:
    """Get a list of collections form CMR based on keywords.

    Args:
        keywords: A string of text to search collections with.
    """
    args = {}

    if keyword is not None:
         args['keyword'] = keyword

    collections = earthaccess.search_datasets(count=5,  **args )
    
    return [format_dataset(ds) for ds in collections]

if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=5001)
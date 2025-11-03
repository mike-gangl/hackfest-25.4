import earthaccess
import logging
import traceback
import uvicorn
import requests

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


@mcp.tool(
    name="check_compliance",
    description="Check the metadata compliance of a file by using NASAs metadata compliance checker",
    tags={"metadata"}
)
async def check_compliance(

    file_path: str,
    compliance: str= "CF",
    compliance_version: str="1.7") -> str:
    """Check the compliance of a file against the MCC

    Args:
        filepath: (Required) Location on the local filesystem of the file to upload
        compliance: (Required) The compliance checks to run (e.g. CF, GDS2)
        compliance_version: (Required) The version of the given compliance to use. (e.g. 1.7)

    """
    args = {}
    if file_path is not None:
         args['file_path'] = file_path
    if compliance is not None:
         args['compliance'] = compliance
    if compliance_version is not None:
         args['compliance_version'] = compliance_version

    try:
        # curl -L -F CF=on -F CF-version=1.7 -F file-upload=@20020901090000-JPL-L4_GHRSST-SSTfnd-MUR25-GLOB-v02.0-fv04.2.nc -F response=json https://mcc.podaac.earthdatacloud.nasa.gov/check
        print("making request")
        url = "https://mcc.podaac.earthdatacloud.nasa.gov/check"
        form_data = {compliance:"on", "CF-version": compliance_version, "response":"json"}
        resp = requests.post(url, data=form_data, files={'file-upload': open(file_path, 'rb')}, allow_redirects=True)
        logger.debug(len(resp.json()))
        #alerts = [format_dataset(feature) for feature in data["features"]]
        return resp.json()



    except:
        import traceback
        traceback.print_exc()

        print("error!")

@mcp.tool(
    name="get_file_metadata",
    description="Returns the metadata from a given netCDF file using xarray.",
    tags={"metadata"},
    output_schema=None
)
async def get_file_metadata(

    file_path: str) -> str:
    """return a list of the global metadata from a netCDF file

    Args:
        filepath: (Required) Location on the local filesystem of the file to get metatdata from

    """
    args = {}
    if file_path is not None:
         args['file_path'] = file_path
    import xarray as xr

    try:
       ds = xr.open_dataset(file_path, engine="netcdf4")
       metadata = ds.attrs
       print(metadata)
       return json.dumps(metadata, cls=NpEncoder)

    except:
        import traceback
        traceback.print_exc()
        print("error!")


import json
import numpy as np

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

# Your codes .... 




if __name__ == "__main__":

    uvicorn.run(app, host="127.0.0.1", port=5001)

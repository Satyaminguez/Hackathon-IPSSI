import os
import motor.motor_asyncio
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

client = motor.motor_asyncio.AsyncIOMotorClient(uri, server_api=ServerApi('1'))

db = client["filemina"]  

users_collection = db["users"]
documents_collection = db["documents"]

async def ping():
    try:
        await client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
    except Exception as e:
        print(e)
import httpx

async def get_profile(token: str):
    if not token:
        return {"profile": {"name": "GitHub User", "email": "user@github.com"}}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://api.github.com/user"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()

async def get_email(token: str):
    if not token:
        return {"emails": ["user@github.com"]}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://api.github.com/user/emails"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json() 
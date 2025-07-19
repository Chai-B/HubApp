import httpx

async def get_gmail_messages(token: str):
    if not token:
        return {"messages": []}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://gmail.googleapis.com/gmail/v1/users/me/messages"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()

async def get_calendar_events(token: str):
    if not token:
        return {"items": []}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()

async def get_meet_links(token: str):
    # Fetch Google Calendar events and extract Meet links
    events = await get_calendar_events(token)
    meet_links = []
    for event in events.get('items', []):
        conference = event.get('conferenceData', {})
        if 'entryPoints' in conference:
            for entry in conference['entryPoints']:
                if entry.get('entryPointType') == 'video' and 'meet.google.com' in entry.get('uri', ''):
                    meet_links.append(entry['uri'])
    return {"meet_links": meet_links}
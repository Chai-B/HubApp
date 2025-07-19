import httpx

async def get_outlook_messages(token: str):
    if not token:
        return {"messages": []}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://graph.microsoft.com/v1.0/me/messages"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()

async def get_calendar_events(token: str):
    if not token:
        return {"value": []}
    headers = {"Authorization": f"Bearer {token}"}
    url = "https://graph.microsoft.com/v1.0/me/events"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        return resp.json()

async def get_teams_meetings(token: str):
    # Fetch Microsoft Calendar events and extract Teams meeting links
    events = await get_calendar_events(token)
    teams_links = []
    for event in events.get('value', []):
        online_meeting = event.get('onlineMeeting')
        if online_meeting and 'joinUrl' in online_meeting:
            teams_links.append(online_meeting['joinUrl'])
        elif 'body' in event and 'teams.microsoft.com' in event['body'].get('content', ''):
            # Fallback: search for teams link in event body
            import re
            matches = re.findall(r'https://teams.microsoft.com/l/meetup-join[^\s"]+', event['body']['content'])
            teams_links.extend(matches)
    return {"teams_links": teams_links} 
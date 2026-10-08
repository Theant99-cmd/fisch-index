import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(headless=True)
        pg=await b.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36")
        await pg.goto("https://fischipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Rods&cmlimit=20&format=json",timeout=45000)
        await pg.wait_for_timeout(8000)
        print((await pg.content())[:800])
        await b.close()
asyncio.run(main())

import { expect, test } from "@playwright/test";

test("reader never fetches editor content; owner editing is explicit and preserves versions", async ({ page }) => {
  let editorRequests = 0;
  let saved: unknown;
  const item = { number: 1, date: "2026-12-01", title: "A little anticipation", body: "Make time together.", published: true, version: 3 };
  await page.route("**/api/v1/advent/calendars**", async route => {
    const url = new URL(route.request().url());
    let body: unknown = [];
    if (url.pathname.endsWith("/calendars")) body = [{ id: "one", name: "Our December", year: 2026, timezone: "America/Denver", role: "OWNER", tradition: "", presentation: "BOTH" }];
    if (url.pathname.endsWith("/doors")) body = [{ number: 1, date: item.date, state: "AVAILABLE", opened: false }, { number: 2, date: "2026-12-02", state: "LOCKED", opened: false }];
    if (url.pathname.endsWith("/open")) body = item;
    if (url.pathname.endsWith("/editor")) { editorRequests++; body = [item]; }
    if (route.request().method() === "PUT") { saved = route.request().postDataJSON(); body = { ...saved as object, version: 4 }; }
    await route.fulfill({ json: body });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Our December" })).toBeVisible();
  await page.getByRole("button", { name: "Doors", exact: true }).click();
  await expect(page.getByRole("button", { name: "Dec 2: not yet open" })).toBeDisabled();
  expect(editorRequests).toBe(0);
  await page.getByRole("button", { name: "Dec 1: open door" }).click();
  await expect(page.getByRole("heading", { name: item.title })).toBeVisible();
  expect(editorRequests).toBe(0);
  await page.getByRole("button", { name: "Close reading", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("link", { name: "Calendar settings", exact: true }).click();
  await page.getByRole("button", { name: "Edit doors (includes future days)" }).click();
  await page.getByLabel("Title", { exact: true }).fill("Our first tradition");
  await page.getByRole("button", { name: "Save door", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("Door saved.");
  expect(saved).toMatchObject({ title: "Our first tradition", version: 3 });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("a new calendar needs no household and sends selected practices to the shared API", async ({ page }) => {
  let created: Record<string, unknown> | undefined;
  await page.route("**/api/v1/advent/calendars**", async route => {
    if (route.request().method() === "POST") {
      created = route.request().postDataJSON();
      await route.fulfill({ json: { id: "created-calendar" } }); return;
    }
    await route.fulfill({ json: new URL(route.request().url()).pathname.endsWith("/doors") ? [] : created ? [{ id: "created-calendar", ...created, role: "OWNER" }] : [] });
  });
  await page.goto("/");
  await page.getByRole("link", { name: "New calendar", exact: true }).click();
  await page.getByLabel("Calendar name", { exact: true }).fill("Friends at work");
  await page.getByLabel("Christmas presentation").selectOption("BOTH");
  await page.getByLabel("Begin with a gratitude door").check();
  await page.getByRole("button", { name: "Create calendar", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Friends at work", exact: true })).toBeVisible();
  expect(created).toMatchObject({ name: "Friends at work", presentation: "BOTH", thanksgiving: true });
  expect(created).not.toHaveProperty("householdId");
});

test("owner assigns artwork, changes a tradition date, and reuses saved rules", async ({ page }) => {
  let saved: Record<string,unknown> | undefined, reused: Record<string,unknown> | undefined;
  let tradition = { id:"party",title:"Ward Christmas party",body:"Welcome your neighbors.",rule:"CHOOSE_DATE",monthDay:"",overrideDate:"",date:"",artworkId:"",published:true,version:1 };
  await page.route("**/api/v1/advent/calendars**",async route=>{
    const path=new URL(route.request().url()).pathname;
    let body: unknown=[];
    if(path.endsWith("/calendars")) body=[{id:"one",name:"Our Christmas",year:2026,timezone:"America/Denver",role:"OWNER",tradition:"LDS",presentation:"BOTH"},...(reused?[{id:"two",...reused,role:"OWNER",timezone:"America/Denver"}]:[])];
    if(path.endsWith("/traditions/editor")) body=[tradition];
    if(path.endsWith("/artwork")) body=[{id:"ward-party",label:"Ward Christmas party illustration",url:"/icon.svg",alt:"The family at a party"}];
    if(path.endsWith("/traditions/party")&&route.request().method()==="PUT") { saved=route.request().postDataJSON();tradition={...tradition,...saved,version:2};body=tradition; }
    if(path.endsWith("/reuse")) {reused=route.request().postDataJSON();body={id:"two"};}
    await route.fulfill({json:body});
  });
  await page.goto("/");await page.getByRole("link",{name:"Calendar settings",exact:true}).click();await page.getByRole("button",{name:"Plan traditions",exact:true}).click();
  await page.getByLabel("Date for this season (optional override)").fill("2026-12-12");
  await page.getByLabel("Illustration",{exact:true}).selectOption("ward-party");
  await expect(page.getByAltText("The family at a party")).toBeVisible();
  await page.getByRole("button",{name:"Save tradition",exact:true}).click();
  await expect(page.getByRole("status")).toHaveText("Tradition saved.");
  expect(saved).toMatchObject({overrideDate:"2026-12-12",rule:"CHOOSE_DATE",artworkId:"ward-party",version:1});
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByLabel("New calendar name",{exact:true}).fill("Next Christmas");
  await page.getByRole("button",{name:"Reuse saved plan",exact:true}).click();
  await expect(page.getByRole("heading",{name:"Next Christmas",exact:true})).toBeVisible();
  expect(reused).toEqual({name:"Next Christmas",year:2027});
});

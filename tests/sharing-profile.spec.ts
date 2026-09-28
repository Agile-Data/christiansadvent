import {test,expect} from "@playwright/test";
test("profile preferences persist and default new calendar timezone",async({page})=>{
  let prefs={displayName:"Alex",timezone:"America/Denver",language:"en"};
  await page.route("**/auth/profile",r=>r.fulfill({json:{sub:"alex",name:"Alex"}}));
  await page.route("**/api/v1/profile/preferences",r=>{if(r.request().method()==="PUT")prefs=r.request().postDataJSON();return r.fulfill({json:prefs});});
  await page.route("**/api/v1/advent/calendars",r=>r.fulfill({json:[]}));
  await page.goto("/profile");await page.getByLabel("Default timezone",{exact:true}).fill("Europe/London");
  await page.getByLabel("Preferred language",{exact:true}).selectOption("es");
  await page.getByRole("button",{name:"Save profile",exact:true}).click();await expect(page.getByRole("status")).toHaveText("Profile saved.");
  await page.reload();await expect(page.getByLabel("Default timezone",{exact:true})).toHaveValue("Europe/London");
  await expect(page.getByLabel("Preferred language",{exact:true})).toHaveValue("es");
  await page.goto("/");await page.getByRole("link",{name:"New calendar",exact:true}).click();await expect(page.getByLabel("Timezone",{exact:true})).toHaveValue("Europe/London");
});
test("owner adds named co-editors without exposing invitation codes in the roster",async({page})=>{
  let saved:unknown;
  await page.route("**/api/v1/profile/preferences",r=>r.fulfill({json:{language:"en"}}));
  await page.route("**/api/v1/advent/calendars**",async r=>{
    const path=new URL(r.request().url()).pathname;let body:unknown=[];
    if(path.endsWith("/calendars"))body=[{id:"one",name:"Our Christmas",year:2026,timezone:"UTC",role:"OWNER"}];
    if(path.endsWith("/members"))body=[{id:"owner",name:"Alex",role:"OWNER"}];
    if(path.endsWith("/people")){
      if(r.request().method()==="POST"){saved=r.request().postDataJSON();body={code:"a".repeat(32)};}
      else body=saved?[{id:"invite",...saved as object,status:"PENDING",expiresAt:"2026-12-01"}]:[];
    }
    await r.fulfill({json:body});
  });
  await page.goto("/");await page.getByRole("link",{name:"Calendar settings",exact:true}).click();await page.getByRole("button",{name:"Friends and family",exact:true}).click();
  await page.getByLabel("Friend or family member’s name",{exact:true}).fill("Sam");
  await page.getByLabel("Email (optional)",{exact:true}).fill("sam@example.com");
  await page.getByRole("button",{name:"Add person and create link",exact:true}).click();
  await expect(page.getByLabel("Private invitation link",{exact:true})).toHaveValue(/\/join#invite=a{32}$/);
  expect(saved).toEqual({name:"Sam",email:"sam@example.com",canEdit:true});
  await expect(page.getByRole("button",{name:"New link for Sam",exact:true})).toBeVisible();
});
test("co-editors see authoring but not membership management",async({page})=>{
  await page.route("**/api/v1/profile/preferences",r=>r.fulfill({json:{language:"en"}}));
  await page.route("**/api/v1/advent/calendars**",r=>r.fulfill({json:new URL(r.request().url()).pathname.endsWith("/calendars")?[{id:"one",name:"Together",year:2026,timezone:"UTC",role:"EDITOR"}]:[]}));
  await page.goto("/");await page.getByRole("link",{name:"Calendar settings",exact:true}).click();await expect(page.getByRole("button",{name:"Edit doors (includes future days)",exact:true})).toBeVisible();
  await expect(page.getByRole("button",{name:"Friends and family",exact:true})).toHaveCount(0);
});
test("invitation fragment survives navigation without automatic redemption",async({page})=>{
  await page.route("**/api/v1/profile/preferences",r=>r.fulfill({json:{displayName:"Guest",language:"en"}}));
  await page.route("**/api/v1/advent/calendars",r=>r.fulfill({json:[]}));
  await page.goto("/join#invite="+"b".repeat(32));await expect(page.getByRole("link",{name:"Continue to your invitation"})).toBeVisible();
  await expect(page).toHaveURL(/\/join$/);
  await page.goto("/");await expect(page.getByLabel("Invitation code",{exact:true})).toHaveValue("b".repeat(32));
  await expect(page.getByLabel("Your name in this calendar",{exact:true})).toHaveValue("Guest");
});

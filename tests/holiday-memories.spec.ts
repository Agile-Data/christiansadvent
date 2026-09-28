import {test,expect} from "@playwright/test";
test("holiday labels, responsive row colors and shared memories",async({page})=>{
 let memories:unknown[]=[];
 const days=Array.from({length:25},(_,i)=>({number:i+1,date:`2026-12-${String(i+1).padStart(2,"0")}`,state:"AVAILABLE",opened:false}));
 await page.route("**/api/v1/profile/preferences",r=>r.fulfill({json:{language:"en"}}));
 await page.route("**/api/v1/advent/calendars**",r=>{
 const path=new URL(r.request().url()).pathname;let value:unknown=[];
 if(path.endsWith("/calendars"))value=[{id:"one",name:"Family Christmas",year:2026,timezone:"UTC",role:"MEMBER"}];
 else if(path.endsWith("/doors"))value=days;
 else if(path.endsWith("/traditions"))value=[{id:"black",date:"2026-11-27",state:"AVAILABLE",holidayKey:"BLACK_FRIDAY"},{id:"boxing",date:"2026-12-26",state:"AVAILABLE",holidayKey:"BOXING_DAY"}];
 else if(path.endsWith("/doors/24/open")){days[23].opened=true;value={number:24,date:"2026-12-24",title:"Christmas Eve",body:"Our family message"};}
 else if(path.endsWith("/memories")){if(r.request().method()==="PUT")memories=[{id:"memory",author:"Sam",body:r.request().postDataJSON().body,version:1,mine:true,canRemove:true}];value=memories;}
 return r.fulfill({json:value});});
 await page.goto("/");
 await expect(page.getByRole("button",{name:/Nov 27: Black Friday/})).toBeVisible();await expect(page.getByRole("button",{name:/Dec 26: Boxing Day/})).toBeVisible();
 await expect(page.locator('.doors .door').nth(0)).toHaveCSS('background-color','rgb(23, 63, 53)');await expect(page.locator('.doors .door').nth(5)).toHaveCSS('background-color','rgb(158, 48, 69)');
 await page.setViewportSize({width:390,height:844});await expect(page.locator('.doors .door').nth(3)).toHaveCSS('background-color','rgb(158, 48, 69)');
 await page.getByRole("button",{name:/Dec 24: Christmas Eve/}).click();await page.getByLabel("Your memory",{exact:true}).fill("We sang together.");await page.getByRole("button",{name:"Share my memory",exact:true}).click();await expect(page.getByText("We sang together.",{exact:true})).toBeVisible();await expect(page.getByRole("button",{name:/Dec 24: Christmas Eve/})).toHaveCSS('background-color','rgb(255, 255, 255)');
});

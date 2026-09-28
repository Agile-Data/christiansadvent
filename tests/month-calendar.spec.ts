import {test,expect} from '@playwright/test';
test('month calendar aligns dates and opens doors on mobile',async({page})=>{
 await page.route('**/api/v1/profile/preferences',r=>r.fulfill({json:{language:'en'}}));
 await page.route('**/api/v1/advent/calendars**',r=>{const p=new URL(r.request().url()).pathname;let body:any=[];
 if(p.endsWith('/calendars'))body=[{id:'one',name:'Our Christmas',year:2026,timezone:'UTC',role:'OWNER'}];
 else if(p.endsWith('/doors'))body=[{number:1,date:'2026-12-01',state:'AVAILABLE',opened:false},{number:24,date:'2026-12-24',state:'LOCKED',opened:false}];
 else if(p.endsWith('/traditions'))body=[{id:'new-year',date:'2027-01-01',state:'LOCKED',holidayKey:'NEW_YEARS_DAY'}];
 else if(p.endsWith('/open'))body={number:1,date:'2026-12-01',title:'First reading',body:'A Christmas story.'};
 return r.fulfill({json:body});});
 await page.goto('/');await expect(page.getByRole('heading',{name:'December 2026',exact:true})).toBeVisible();await expect(page.getByRole('heading',{name:'January 2027',exact:true})).toBeVisible();
 const first=page.getByRole('button',{name:'Tuesday, December 1, 2026: Advent door: open door',exact:true});await expect(first).toBeVisible();expect(await page.locator('.month-days').first().locator('.month-blank').count()).toBe(2);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);await first.click();await expect(page.getByRole('dialog')).toBeVisible();await expect(page.getByText('A Christmas story.',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Close reading',exact:true}).click();await page.getByRole('button',{name:'Doors',exact:true}).click();await expect(page.getByRole('button',{name:'Dec 1: open door',exact:true})).toBeVisible();
});

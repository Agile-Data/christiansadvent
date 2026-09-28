import {test,expect} from '@playwright/test';
test('dialog has calendar URL, survives reload, and follows browser history',async({page})=>{
 await page.route('**/api/v1/profile/preferences',r=>r.fulfill({json:{language:'en'}}));
 await page.route('**/api/v1/advent/calendars**',r=>{const path=new URL(r.request().url()).pathname;let body:unknown=[];
 if(path.endsWith('/calendars'))body=[{id:'one',name:'Together',year:2026,timezone:'UTC',role:'MEMBER'}];
 else if(path.endsWith('/doors'))body=[{number:1,date:'2026-12-01',state:'AVAILABLE',opened:false},{number:2,date:'2026-12-02',state:'AVAILABLE',opened:false}];
 else if(path.endsWith('/open'))body={number:1,date:'2026-12-01',title:'A little wonder',body:'Our Christmas reading'};
 return r.fulfill({json:body});});
 await page.goto('/');const door=page.getByRole('button',{name:'Dec 1: open door',exact:true});await door.click();
 await expect(page).toHaveURL(/\/calendar\/one#day-1$/);await expect(page.getByRole('dialog',{name:'A little wonder'})).toBeVisible();await expect(page.getByRole('button',{name:'Close reading',exact:true})).toBeFocused();
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(door).toBeFocused();await expect(page).not.toHaveURL(/#day/);
 await page.goForward();await expect(page.getByRole('dialog')).toBeVisible();await page.reload();await expect(page.getByRole('dialog',{name:'A little wonder'})).toBeVisible();
 await page.setViewportSize({width:390,height:844});await expect(page.getByRole('dialog')).toHaveCSS('width','390px');await expect(page.locator('body')).toHaveCSS('overflow','hidden');
 await page.getByRole('button',{name:'Next day',exact:true}).click();await expect(page).toHaveURL(/#day-2$/);
 await page.getByRole('button',{name:'Back to calendar',exact:true}).click();await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.goto('/calendar/one#day-1');await expect(page.getByRole('dialog')).toBeVisible();await page.getByRole('button',{name:'Next day',exact:true}).click();await page.getByRole('button',{name:'Close reading',exact:true}).click();await expect(page).toHaveURL(/\/calendar\/one$/);
});

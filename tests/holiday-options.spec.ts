import {test,expect} from '@playwright/test';
test('creation submits independent holidays and regional Boxing Day defaults',async({page})=>{
 let created:any;
 await page.route('**/api/v1/profile/preferences',r=>r.fulfill({json:{language:'en',timezone:'UTC'}}));
 await page.route('**/api/v1/advent/calendars**',r=>{if(r.request().method()==='POST'){created=r.request().postDataJSON();return r.fulfill({json:{id:'new-calendar'}});}return r.fulfill({json:[]});});
 await page.goto('/');await page.getByRole('link',{name:'New calendar',exact:true}).click();await page.getByLabel('Calendar name',{exact:true}).fill('Holiday review');await page.getByLabel('Year',{exact:true}).fill('2026');
 const boxing=page.getByRole('checkbox',{name:/Include Boxing Day/});await expect(boxing).not.toBeChecked();await page.getByRole('combobox',{name:'Holiday region',exact:true}).selectOption('CA');await expect(boxing).toBeChecked();await boxing.uncheck();await page.getByRole('combobox',{name:'Holiday region',exact:true}).selectOption('GB');await expect(boxing).not.toBeChecked();
 await page.getByRole('checkbox',{name:/Include Black Friday/}).uncheck();await page.getByRole('checkbox',{name:/Begin with a gratitude/}).uncheck();await page.getByRole('checkbox',{name:/Include New Year’s Eve/}).check();await page.getByRole('checkbox',{name:/Include New Year’s Day/}).check();await expect(page.getByText('Include New Year’s Day · January 1, 2027',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Create calendar',exact:true}).click();await expect.poll(()=>created?.newYearsDay).toBe(true);expect(created).toMatchObject({thanksgiving:false,blackFriday:false,boxingDay:false,newYearsEve:true,newYearsDay:true});
});

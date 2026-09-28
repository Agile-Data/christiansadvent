import {test,expect} from '@playwright/test';
test('navigation hydrates and restores focus after Escape',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto('/navigation');const trigger=page.getByRole('button',{name:'Open navigation menu',exact:true});await trigger.click();await expect(page.getByRole('dialog',{name:'Advent',exact:true})).toBeVisible();
 await expect(page.getByRole('link',{name:'My calendars',exact:true})).toHaveAttribute('href','/calendar');await expect(page.getByRole('link',{name:'My recipes & meals',exact:true})).toHaveAttribute('href','/profile/recipes');await expect(page.getByRole('link',{name:'Profile & preferences',exact:true})).toHaveAttribute('href','/profile');
 await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();await expect(trigger).toBeFocused();await expect(trigger).toHaveAttribute('aria-expanded','false');await trigger.click();await page.getByRole('button',{name:'Close navigation menu',exact:true}).click();await expect(trigger).toBeFocused();expect(errors.filter(e=>/hydrat|didn.t match/i.test(e))).toEqual([]);
});

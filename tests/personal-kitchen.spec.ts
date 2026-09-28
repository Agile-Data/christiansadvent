import {test,expect} from '@playwright/test';
import {nutritionTotals,type Ingredient} from '../components/RecipeNutrition';
test('nutrition uses weights, preserves missing values and divides by servings',()=>{
 const source={source:'Test label',gramsPerUnit:120,calories:100,protein:2,carbohydrates:20,fat:1,fiber:0,sugar:0,sodium:10};
 const ingredients:Ingredient[]=[{name:'Flour',note:'',quantity:2,unit:'cup',nutrition:source},{name:'Other',note:'',quantity:100,unit:'g',nutrition:source}];
 expect(nutritionTotals(ingredients,4)[0].perServing).toBe(85);
 expect(nutritionTotals(ingredients,8)[0].perServing).toBe(42.5);
 expect(nutritionTotals([{...ingredients[0],nutrition:{...source,gramsPerUnit:null}}],4)[0].missing).toBe(1);
 expect(nutritionTotals([{...ingredients[0],nutrition:{...source,sodium:null}}],4).find(n=>n.key==='sodium')?.missing).toBe(1);
 expect(nutritionTotals([{...ingredients[0],quantity:null}],4)[0].missing).toBe(1);
 expect(nutritionTotals([{...ingredients[0],unit:'lb',quantity:1}],1)[0].total).toBeCloseTo(453.59237);
});
test('personal recipes include nutrition, dietary variations and explicit calendar sharing',async({page})=>{
 const recipes:any[]=[];let shared:any;
 await page.route('**/api/v1/advent/calendars',r=>r.fulfill({json:[{id:'calendar1',name:'Our Christmas',year:2026,role:'MEMBER'}]}));
 await page.route('**/api/v1/profile/kitchen**',r=>{const path=new URL(r.request().url()).pathname;let body:any=[];
 if(path.endsWith('/recipes')){if(r.request().method()==='POST'){recipes.push({...r.request().postDataJSON(),id:`r${recipes.length+1}`,version:1,canEdit:true,contributor:'You'});body={id:recipes.at(-1).id};}else body=recipes;}
 else if(path.endsWith('/share')){shared=r.request().postDataJSON();body={id:'copy1'};}
 else if(path.endsWith('/occasions'))body=[{key:'anytime',title:'Personal meal',date:''}];
 else if(path.endsWith('/foods/search'))body=[{id:'123',description:'Test potatoes',brand:'',nutrition:{source:'USDA test fixture',gramsPerUnit:null,calories:80,protein:2,carbohydrates:17,fat:0,fiber:2,sugar:1,sodium:5}}];
 return r.fulfill({json:body});});
 await page.goto('/personal');await page.getByRole('button',{name:'Add family recipe',exact:true}).click();
 await page.getByLabel('Recipe name',{exact:true}).fill('Personal potatoes');await page.getByLabel('Recipe serves',{exact:true}).fill('4');await page.getByLabel('Quantity 1',{exact:true}).fill('1');await page.getByRole('combobox',{name:'Unit 1',exact:true}).selectOption('kg');await page.getByLabel('Ingredient 1',{exact:true}).fill('Potatoes');await page.getByLabel('Instructions',{exact:true}).fill('Our method.');
 await page.getByText('Nutrition for ingredient 1 · not added',{exact:true}).click();await page.getByLabel('Food search 1',{exact:true}).fill('Potatoes');await page.getByRole('button',{name:'Search USDA foods'}).click();await page.getByRole('button',{name:'Test potatoes · FDC 123'}).click();
 await page.getByRole('checkbox',{name:'Gluten-free',exact:true}).check();await page.getByLabel('Variations and substitutions',{exact:true}).fill('Use a separately checked gluten-free seasoning.');await expect(page.getByRole('cell',{name:'200',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Save recipe',exact:true}).click();await expect(page.getByRole('heading',{name:'Personal potatoes',exact:true})).toBeVisible();expect(recipes[0].dietary).toContain('Gluten-free');
 await page.getByRole('combobox',{name:'Share with calendar',exact:true}).selectOption('calendar1');await page.getByRole('button',{name:'Add recipe to calendar',exact:true}).click();await expect(page.getByText('Copy added to the calendar.',{exact:true})).toBeVisible();expect(shared.calendarId).toBe('calendar1');
 await page.getByRole('button',{name:'Make a variation',exact:true}).click();await page.getByLabel('Ingredient 1',{exact:true}).fill('Sweet potatoes');await expect(page.getByText('Nutrition for ingredient 1 · not added',{exact:true})).toBeVisible();await expect(page.getByRole('cell',{name:'Incomplete (0/1 ingredients)',exact:true})).toHaveCount(7);
 await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});

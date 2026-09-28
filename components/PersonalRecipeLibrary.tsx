"use client";
import FamilyKitchen from './FamilyKitchen';
import {personalAPI} from './RecipeNutrition';
export default function PersonalRecipeLibrary(){return <main className="calendar-page"><p className="eyebrow">Your account · your family table</p><FamilyKitchen personal calendarId="" canPlan api={personalAPI} onClose={()=>{window.location.href='/calendar';}}/></main>;}

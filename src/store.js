import { writable } from "svelte/store";

const standardValues = [
    {'name': 'name', 'caption'  : 'Name',  'position': [75, 240], 'value': '', type: 1}, 
    {'name': 'address', 'caption'  : 'Adresse',  'position': [75, 300], 'value': '', type: 2},
    {'name': 'birthdate', 'caption'  : 'Geburtsdatum',  'position': [150, 365], 'value': '', type: 1},
    {'name': 'testdate', 'caption'  : 'Testdatum',  'position': [75, 440], 'value': '', type: 5},
    {'name': 'testtime', 'caption'  : 'Testuhrzeit',  'position': [75, 478], 'value': '', type: 4},
    {'name': 'testperson', 'caption'  : 'Durchführender',  'position': [75, 525], 'value': '', type: 1},
    {'name': 'signature', 'caption'  : 'Unterschriftdatum',  'position': [75, 595], 'value': '', type: 5},
    {'name': 'result', 'caption'  : 'Test Negativ',  'position': [250, 635], 'value': true, type: 6},
];
const storedValues = JSON.parse(localStorage.getItem("EigenbescheinigungValues"));
let localValues = Array();
if(storedValues){
    localValues = storedValues;
}else{
    localValues = standardValues;
}
export const values = writable(localValues);

values.subscribe(value => {
    localStorage.setItem("EigenbescheinigungValues", JSON.stringify(value));
});
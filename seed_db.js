const fs = require('fs');
const dbStr = fs.readFileSync('db.json', 'utf8');
const db = JSON.parse(dbStr);

const appStr = fs.readFileSync('src/App.tsx', 'utf8');
const objStr = fs.readFileSync('src/components/Objectives.tsx', 'utf8');

if (db.debts.length === 0) {
    const dMatch = appStr.match(/export const initialDebts \= (\[[\s\S]*?\]);/);
    if (dMatch) {
       const text = dMatch[1]
          .replace(/id:/g, '"id":')
          .replace(/titular:/g, '"titular":')
          .replace(/banco:/g, '"banco":')
          .replace(/valor:/g, '"valor":')
          .replace(/tipo:/g, '"tipo":')
          .replace(/vlrP:/g, '"vlrP":')
          .replace(/qtd:/g, '"qtd":')
          .replace(/status:/g, '"status":');
       try { db.debts = JSON.parse(text); } catch (e) { console.error("Error parsing debts:", e); }
    }
}

if (db.objectives.length === 0) {
    const oMatch = objStr.match(/export const initialObjectives: Objective\[\] \= (\[[\s\S]*?\]);/);
     if (oMatch) {
        const text2 = oMatch[1]
          .replace(/\/\/.*/g, '') // remove comments
          .replace(/id:/g, '"id":')
          .replace(/icon:/g, '"icon":')
          .replace(/name:/g, '"name":')
          .replace(/targetBRL:/g, '"targetBRL":')
          .replace(/targetUSD:/g, '"targetUSD":')
          .replace(/accumulatedBRL:/g, '"accumulatedBRL":')
          .replace(/completed:/g, '"completed":')
          .replace(/category:/g, '"category":');
       try { db.objectives = JSON.parse(text2); } catch (e) { console.error("Error parsing objs:", e); }
    }
}

fs.writeFileSync('db.json', JSON.stringify(db, null, 2));
console.log('Database seeded.');

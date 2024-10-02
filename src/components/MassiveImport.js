import { addDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

import { db } from './../configuration';
import { collection, getDocs } from 'firebase/firestore';
import Entita from './../models/Entita';
import PreparazioneEntita from '../models/PreparazioneEntita';
import Preparazione from '../models/Preparazione';
import { keyBy, groupBy, groupByToSet } from './../utils'
function MassiveImport() {
  
  const [data, setData] = useState(null);
  const preparazioneCollection = collection(db, 'preparazione');
  const preparazioneEntitaCollection = collection(db, 'preparazione-entita');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      console.log('sheetData', sheetData)
      sheetData.forEach(async (data) => await addDoc(preparazioneCollection, {giorno: new Date((data.Date - (25567 + 2))*86400*1000 ), parola: data.Parola ?? '', isSabato: data.isSabato ?? false}))
      console.log('ok')
      setData(sheetData);
    };

    reader.readAsBinaryString(file);
  };
  const handleFileUploadP = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const workbook = XLSX.read(event.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);
      console.log('sheetData', sheetData)
      sheetData.forEach(async (data) =>  {
        data.partecipanti.split(',').forEach(async (partecipanteId) => {
          await addDoc(preparazioneEntitaCollection, {preparazione: data.evento, entita: partecipanteId.trim()})
        })
      })
      console.log('ok')
      setData(sheetData);
    };

    reader.readAsBinaryString(file);
  };
  useEffect(() => {
    
  }, []);

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      <input type="file" label='partecipanti' onChange={handleFileUploadP} />
      {data && (
        <div>
          <h2>Imported Data:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default MassiveImport;

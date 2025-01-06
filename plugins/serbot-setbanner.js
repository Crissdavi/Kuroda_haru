import fs from 'fs';  
import path from 'path';  

let handler = async (m, { conn, isRowner }) => {
  try {
   
    const media = await m.quoted.download();

  
    if (!isImageValid(media)) {
      return m.reply('El archivo enviado no es una imagen válida.');
    }

  
    global.imagen1 = media;  


    m.reply('El banner ha sido actualizado');

  } catch (error) {
    console.error(error);
    m.reply('Hubo un error al intentar cambiar el banner.');
  }
};


const isImageValid = (buffer) => {
  const magicBytes = buffer.slice(0, 4).toString('hex');
  

  if (magicBytes === 'ffd8ffe0' || magicBytes === 'ffd8ffe1' || magicBytes === 'ffd8ffe2') {
    return true;
  }

 
  if (magicBytes === '89504e47') {
    return true;
  }


  if (magicBytes === '47494638') {
    return true;
  }

  return false; 
};

handler.help = ['setbanner'];  
handler.tags = ['banner'];    
handler.command = ['setban', 'setbanner'];  
handler.rowner = true
export default handler;
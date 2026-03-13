import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export interface DocumentData {
  type: 'ai_policy' | 'employee_notice' | 'systems_register' | 'fria' | 'candidate_notice';
  title: string;
  organizationId: string;
  organizationName: string;
  useCases?: Array<{
    id: string;
    name: string;
    riskLevel: 'prohibited' | 'high' | 'limited' | 'minimal';
    classification?: string;
  }>;
  generatedAt: string;
}

export async function generatePDF(data: DocumentData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  
  let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  
  let y = height - 50;
  const margin = 50;
  const lineHeight = 20;
  const maxWidth = width - 2 * margin;
  
  // Helper to wrap text
  const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const textWidth = timesRomanFont.widthOfTextAtSize(testLine, fontSize);
      
      if (textWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };
  
  // Helper to add wrapped text
  const addWrappedText = (text: string, fontSize: number, isBold = false, indent = 0) => {
    const font = isBold ? timesRomanBold : timesRomanFont;
    const lines = wrapText(text, maxWidth - indent, fontSize);
    
    for (const line of lines) {
      if (y < 50) {
        // Add new page
        const newPage = pdfDoc.addPage([595.28, 841.89]);
        y = newPage.getSize().height - 50;
        page = newPage;
      }
      
      page.drawText(line, {
        x: margin + indent,
        y,
        size: fontSize,
        font,
        color: rgb(0.1, 0.1, 0.1),
      });
      y -= lineHeight;
    }
    y -= 10; // Extra space after paragraph
  };
  
  // Header
  page.drawText('CUMPPLIA', {
    x: margin,
    y: height - 30,
    size: 10,
    font: timesRomanBold,
    color: rgb(0.3, 0.3, 0.3),
  });
  
  page.drawText(data.generatedAt, {
    x: width - margin - 100,
    y: height - 30,
    size: 10,
    font: timesRomanFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  y = height - 80;
  
  // Title
  const titles: Record<string, string> = {
    ai_policy: 'POLÍTICA DE USO DE INTELIGENCIA ARTIFICIAL',
    employee_notice: 'NOTIFICACIÓN A EMPLEADOS SOBRE SISTEMAS DE IA',
    systems_register: 'REGISTRO DE SISTEMAS DE IA',
    fria: 'EVALUACIÓN DE IMPACTO EN LOS DERECHOS FUNDAMENTALES (FRIA)',
    candidate_notice: 'NOTIFICACIÓN A CANDIDATOS SOBRE IA EN PROCESOS DE SELECCIÓN',
  };
  
  page.drawText(titles[data.type] || 'DOCUMENTO DE CUMPLIMIENTO', {
    x: margin,
    y,
    size: 18,
    font: timesRomanBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 30;
  
  // Organization
  page.drawText(`Organización: ${data.organizationName}`, {
    x: margin,
    y,
    size: 12,
    font: timesRomanBold,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 40;
  
  // Content based on document type
  switch (data.type) {
    case 'ai_policy':
      await generateAIPolicyContent(addWrappedText, data);
      break;
    case 'employee_notice':
      await generateEmployeeNoticeContent(addWrappedText, data);
      break;
    case 'systems_register':
      await generateSystemsRegisterContent(addWrappedText, data);
      break;
    case 'fria':
      await generateFRIAContent(addWrappedText, data);
      break;
    case 'candidate_notice':
      await generateCandidateNoticeContent(addWrappedText, data);
      break;
  }
  
  // Footer on each page
  const pages = pdfDoc.getPages();
  pages.forEach((p, index) => {
    p.drawText(`Página ${index + 1} de ${pages.length}`, {
      x: width / 2 - 30,
      y: 20,
      size: 9,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });
    p.drawText('Generado por Cumplia - cumplia.io', {
      x: margin,
      y: 20,
      size: 8,
      font: timesRomanFont,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  
  return await pdfDoc.save();
}

async function generateAIPolicyContent(
  addWrappedText: (text: string, size: number, bold?: boolean, indent?: number) => void,
  data: DocumentData
) {
  addWrappedText('1. OBJETIVO Y ALCANCE', 14, true);
  addWrappedText(
    `La presente política establece los principios y directrices para el uso responsable de sistemas de Inteligencia Artificial (IA) en ${data.organizationName}, en cumplimiento del Reglamento de la Unión Europea sobre Inteligencia Artificial (AI Act).`,
    11
  );
  addWrappedText(
    'Esta política aplica a todos los empleados, contratistas y terceros que utilicen o interactúen con sistemas de IA en el ámbito de sus funciones laborales.',
    11
  );
  
  addWrappedText('2. PRINCIPIOS GENERALES', 14, true);
  addWrappedText('2.1 Uso Responsable: Los sistemas de IA deben utilizarse de manera ética, transparente y responsable.', 11);
  addWrappedText('2.2 Supervisión Humana: Las decisiones automatizadas significativas deben incluir supervisión humana adecuada.', 11);
  addWrappedText('2.3 Privacidad y Protección de Datos: El uso de IA debe respetar el RGPD y la normativa de protección de datos aplicable.', 11);
  addWrappedText('2.4 No Discriminación: Los sistemas de IA no deben generar resultados discriminatorios basados en características protegidas.', 11);
  
  addWrappedText('3. SISTEMAS DE IA AUTORIZADOS', 14, true);
  addWrappedText(
    'Solo podrán utilizarse sistemas de IA previamente evaluados y registrados en el inventario de sistemas de IA de la organización. El uso de sistemas no autorizados está prohibido.',
    11
  );
  
  if (data.useCases && data.useCases.length > 0) {
    addWrappedText('Sistemas registrados actualmente:', 11, true);
    data.useCases.forEach((useCase, index) => {
      addWrappedText(`${index + 1}. ${useCase.name} (Nivel de riesgo: ${useCase.riskLevel})`, 11, false, 20);
    });
  }
  
  addWrappedText('4. PROHIBICIONES', 14, true);
  addWrappedText('Queda estrictamente prohibido el uso de sistemas de IA para:', 11);
  addWrappedText('• Sistemas de puntuación social por parte de autoridades públicas', 11, false, 20);
  addWrappedText('• Manipulación subliminal o explotación de vulnerabilidades', 11, false, 20);
  addWrappedText('• Clasificación biométrica remota en espacios públicos', 11, false, 20);
  addWrappedText('• Sistemas de predicción delictiva basados en perfilado', 11, false, 20);
  
  addWrappedText('5. INCUMPLIMIENTOS Y SANCIONES', 14, true);
  addWrappedText(
    'El incumplimiento de esta política puede resultar en medidas disciplinarias, incluyendo la terminación de la relación laboral o contractual, además de las sanciones legales aplicables según el AI Act.',
    11
  );
  
  addWrappedText('6. REVISIÓN Y ACTUALIZACIÓN', 14, true);
  addWrappedText(
    'Esta política será revisada anualmente o cuando haya cambios significativos en la normativa aplicable.',
    11
  );
}

async function generateEmployeeNoticeContent(
  addWrappedText: (text: string, size: number, bold?: boolean, indent?: number) => void,
  data: DocumentData
) {
  addWrappedText('1. INFORMACIÓN GENERAL', 14, true);
  addWrappedText(
    `En cumplimiento del Reglamento (UE) 2024/1689 (AI Act) y la Ley Orgánica 3/2018 de Protección de Datos, ${data.organizationName} informa a sus empleados sobre el uso de sistemas de Inteligencia Artificial en el ámbito laboral.`,
    11
  );
  
  addWrappedText('2. SISTEMAS DE IA UTILIZADOS', 14, true);
  
  if (data.useCases && data.useCases.length > 0) {
    data.useCases.forEach((useCase, index) => {
      addWrappedText(`${index + 1}. ${useCase.name}`, 12, true);
      addWrappedText(`Nivel de riesgo: ${useCase.riskLevel.toUpperCase()}`, 11, false, 20);
      if (useCase.classification) {
        addWrappedText(`Clasificación: ${useCase.classification}`, 11, false, 20);
      }
    });
  } else {
    addWrappedText('Actualmente no hay sistemas de IA registrados que afecten directamente a los empleados.', 11);
  }
  
  addWrappedText('3. DERECHOS DE LOS EMPLEADOS', 14, true);
  addWrappedText('3.1 Derecho a la información: Los empleados tienen derecho a conocer cuando interactúan con sistemas de IA.', 11);
  addWrappedText('3.2 Derecho a la intervención humana: Derecho a solicitar revisión humana de decisiones automatizadas.', 11);
  addWrappedText('3.3 Derecho a no ser sometido a decisiones automatizadas: En ciertos casos, el derecho a no ser objeto de decisiones basadas únicamente en automatización.', 11);
  addWrappedText('3.4 Derecho de acceso: Derecho a conocer la lógica subyacente a los sistemas de IA utilizados.', 11);
  
  addWrappedText('4. SUPERVISIÓN Y CONTROL', 14, true);
  addWrappedText(
    'Todos los sistemas de IA han sido evaluados según los requisitos del AI Act y cuentan con las medidas de supervisión humana requeridas.',
    11
  );
  
  addWrappedText('5. CONTACTO', 14, true);
  addWrappedText(
    'Para cualquier consulta relacionada con el uso de IA en la organización, contacte con el Delegado de Protección de Datos o el Responsable de Cumplimiento.',
    11
  );
}

async function generateSystemsRegisterContent(
  addWrappedText: (text: string, size: number, bold?: boolean, indent?: number) => void,
  data: DocumentData
) {
  addWrappedText('REGISTRO DE SISTEMAS DE INTELIGENCIA ARTIFICIAL', 16, true);
  addWrappedText(
    `Organización: ${data.organizationName}`,
    12
  );
  addWrappedText(
    `Fecha de generación: ${data.generatedAt}`,
    11
  );
  addWrappedText(
    'Este registro cumple con los requisitos del Artículo 71 del Reglamento (UE) 2024/1689 (AI Act).',
    11
  );
  
  if (data.useCases && data.useCases.length > 0) {
    data.useCases.forEach((useCase, index) => {
      addWrappedText(`SISTEMA ${index + 1}: ${useCase.name.toUpperCase()}`, 13, true);
      addWrappedText(`ID: ${useCase.id}`, 11);
      addWrappedText(`Nivel de riesgo: ${useCase.riskLevel.toUpperCase()}`, 11);
      if (useCase.classification) {
        addWrappedText(`Clasificación AI Act: ${useCase.classification}`, 11);
      }
      addWrappedText('Estado: Registrado y evaluado conforme al AI Act.', 11);
    });
  } else {
    addWrappedText('No hay sistemas de IA registrados actualmente.', 11);
  }
  
  addWrappedText('NOTAS LEGALES', 14, true);
  addWrappedText(
    'Este registro debe mantenerse actualizado ante cualquier modificación, nuevo despliegue o retirada de sistemas de IA. El incumplimiento puede resultar en sanciones según el AI Act.',
    11
  );
}

async function generateFRIAContent(
  addWrappedText: (text: string, size: number, bold?: boolean, indent?: number) => void,
  data: DocumentData
) {
  addWrappedText('EVALUACIÓN DE IMPACTO EN LOS DERECHOS FUNDAMENTALES (FRIA)', 16, true);
  addWrappedText('Reglamento (UE) 2024/1689 - Artículos 27-29', 12);
  
  addWrappedText('1. IDENTIFICACIÓN DEL SISTEMA', 14, true);
  if (data.useCases && data.useCases[0]) {
    addWrappedText(`Nombre del sistema: ${data.useCases[0].name}`, 11);
    addWrappedText(`ID: ${data.useCases[0].id}`, 11);
    addWrappedText(`Clasificación: ${data.useCases[0].classification || 'Alta IA'}`, 11);
  } else {
    addWrappedText('Sistema: [Nombre del sistema evaluado]', 11);
  }
  addWrappedText(`Organización responsable: ${data.organizationName}`, 11);
  addWrappedText(`Fecha de evaluación: ${data.generatedAt}`, 11);
  
  addWrappedText('2. DESCRIPCIÓN DEL SISTEMA', 14, true);
  addWrappedText(
    'El sistema de IA objeto de esta evaluación procesa datos personales y puede afectar derechos fundamentales de las personas físicas. Esta FRIA evalúa los riesgos y medidas de mitigación aplicables.',
    11
  );
  
  addWrappedText('3. ÁMBITO DE APLICACIÓN', 14, true);
  addWrappedText('3.1 Personas afectadas: Empleados, clientes y terceros que interactúan con el sistema.', 11);
  addWrappedText('3.2 Datos procesados: Datos personales según categorías definidas en el RGPD.', 11);
  addWrappedText('3.3 Decisiones automatizadas: El sistema puede tomar decisiones con impacto significativo.', 11);
  
  addWrappedText('4. EVALUACIÓN DE RIESGOS', 14, true);
  addWrappedText('4.1 Riesgos identificados:', 11, true);
  addWrappedText('• Sesgo algorítmico y discriminación potencial', 11, false, 20);
  addWrappedText('• Falta de transparencia en decisiones automatizadas', 11, false, 20);
  addWrappedText('• Privacidad y protección de datos', 11, false, 20);
  addWrappedText('• Derecho a la no discriminación', 11, false, 20);
  
  addWrappedText('4.2 Medidas de mitigación:', 11, true);
  addWrappedText('• Supervisión humana obligatoria para decisiones significativas', 11, false, 20);
  addWrappedText('• Auditorías periódicas de sesgo', 11, false, 20);
  addWrappedText('• Derecho a explicación de decisiones', 11, false, 20);
  addWrappedText('• Registro de incidentes y mejoras continuas', 11, false, 20);
  
  addWrappedText('5. CONCLUSIONES', 14, true);
  addWrappedText(
    'Tras la evaluación realizada, se considera que el sistema cumple con los requisitos del AI Act para sistemas de alto riesgo, siempre que se mantengan las medidas de mitigación implementadas.',
    11
  );
  
  addWrappedText('6. REVISIÓN', 14, true);
  addWrappedText(
    'Esta FRIA debe revisarse anualmente o ante cambios significativos en el sistema o su contexto de uso.',
    11
  );
}

async function generateCandidateNoticeContent(
  addWrappedText: (text: string, size: number, bold?: boolean, indent?: number) => void,
  data: DocumentData
) {
  addWrappedText('NOTIFICACIÓN SOBRE USO DE IA EN PROCESOS DE SELECCIÓN', 16, true);
  
  addWrappedText('1. INFORMACIÓN PREVIA AL CANDIDATO', 14, true);
  addWrappedText(
    `${data.organizationName} informa a los candidatos que en sus procesos de selección se utilizan sistemas de Inteligencia Artificial, en cumplimiento del Reglamento (UE) 2024/1689 (AI Act) y la normativa de protección de datos.`,
    11
  );
  
  addWrappedText('2. SISTEMAS DE IA UTILIZADOS', 14, true);
  addWrappedText(
    'Los sistemas de IA pueden ser utilizados para: análisis de currículums, evaluación de competencias, programación de entrevistas, y otras tareas relacionadas con el proceso de selección.',
    11
  );
  
  addWrappedText('3. DERECHOS DEL CANDIDATO', 14, true);
  addWrappedText('3.1 Derecho a la información: Derecho a conocer el uso de IA en el proceso de selección.', 11);
  addWrappedText('3.2 Derecho a la transparencia: Información sobre la lógica del sistema y criterios de evaluación.', 11);
  addWrappedText('3.3 Derecho a la intervención humana: Posibilidad de solicitar revisión humana de decisiones.', 11);
  addWrappedText('3.4 Derecho de oposición: Derecho a oponerse al uso de sistemas automatizados de evaluación.', 11);
  addWrappedText('3.5 Derechos ARCO: Acceso, rectificación, cancelación y oposición según RGPD.', 11);
  
  addWrappedText('4. PROTECCIÓN DE DATOS', 14, true);
  addWrappedText(
    'Los datos personales proporcionados serán tratados conforme al RGPD y la LOPDGDD únicamente para fines del proceso de selección. Los datos serán conservados durante el plazo legalmente establecido.',
    11
  );
  
  addWrappedText('5. CONTACTO', 14, true);
  addWrappedText(
    'Para ejercer sus derechos o realizar consultas sobre el uso de IA en el proceso de selección, contacte con: [email/contacto DPO]',
    11
  );
  
  addWrappedText('6. CONSENTIMIENTO', 14, true);
  addWrappedText(
    'Al participar en este proceso de selección, el candidato acepta haber sido informado sobre el uso de sistemas de IA y sus derechos conforme a la normativa aplicable.',
    11
  );
}

export async function uploadToStorage(
  pdfBytes: Uint8Array,
  organizationId: string,
  documentId: string
): Promise<{ path: string; publicUrl: string }> {
  const supabase = getSupabaseClient();
  const fileName = `${organizationId}/${documentId}.pdf`;
  
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBytes, {
      contentType: 'application/pdf',
      upsert: true,
    });
  
  if (uploadError) {
    throw new Error(`Error uploading to storage: ${uploadError.message}`);
  }
  
  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
  
  return {
    path: fileName,
    publicUrl: urlData.publicUrl,
  };
}

export async function createSignedUrl(
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, expiresIn);
  
  if (error) {
    throw new Error(`Error creating signed URL: ${error.message}`);
  }
  
  return data.signedUrl;
}

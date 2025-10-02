
import type { Project, SimulatedState } from '../types';

declare const JSZip: any;
declare const saveAs: any;
declare const jspdf: any;

type SaveCodeFunc = (screenId: string | null, composeCode: string, kotlinCode: string) => void;

export const exportProjectZip = async (
    project: Project, 
    simulatedState: SimulatedState,
    saveCurrentScreenCode: SaveCodeFunc,
    currentScreenId: string | null,
    composeCode: string,
    kotlinCode: string
) => {
    saveCurrentScreenCode(currentScreenId, composeCode, kotlinCode);
    
    const zip = new JSZip();
    const projectFolder = zip.folder('compose-web-project');
    if (!projectFolder) return;

    const meta = { exportedAt: new Date().toISOString(), screens: project.screens.map(s => ({id:s.id,name:s.name})) };
    projectFolder.file('project.json', JSON.stringify(meta, null, 2));
    projectFolder.file('state.json', JSON.stringify(simulatedState, null, 2));

    const screensFolder = projectFolder.folder('screens');
    if (!screensFolder) return;
    
    project.screens.forEach(s => {
        screensFolder.file(`${s.name}.dsl.js`, s.compose || '');
        const ktCode = project.files[s.id + '_kotlin'] || '';
        if (ktCode) {
            screensFolder.file(`${s.name}.kt`, ktCode);
        }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `compose-web-project.zip`);
};

export const exportPdf = async (
    project: Project,
    saveCurrentScreenCode: SaveCodeFunc,
    currentScreenId: string | null,
    composeCode: string,
    kotlinCode: string
) => {
    saveCurrentScreenCode(currentScreenId, composeCode, kotlinCode);

    const { jsPDF } = jspdf;
    const doc = new jsPDF({ orientation: 'portrait' });
    let y = 15;

    const addText = (text: string, x: number, currentY: number, size: number, isBold=false) => {
        doc.setFontSize(size);
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        const lines = doc.splitTextToSize(text, 180);
        doc.text(lines, x, currentY);
        return currentY + (lines.length * (size * 0.35));
    };

    y = addText('Compose Mini IDE - Project Export', 10, y, 18, true);
    y += 10;

    project.screens.forEach(screen => {
        if (y > 260) {
            doc.addPage();
            y = 15;
        }
        y = addText(`Screen: ${screen.name}`, 10, y, 14, true);
        y += 2;
        doc.setDrawColor(200);
        doc.line(10, y, 200, y);
        y += 6;

        y = addText('// Compose DSL', 12, y, 10);
        y+=2;
        doc.setFont('courier', 'normal');
        y = addText(screen.compose || '', 12, y, 9);
        y += 8;

        const ktCode = project.files[screen.id + '_kotlin'];
        if (ktCode) {
            if (y > 260) { doc.addPage(); y = 15; }
            y = addText('// Kotlin Code', 12, y, 10);
            y+=2;
            doc.setFont('courier', 'normal');
            y = addText(ktCode, 12, y, 9);
            y+=8;
        }
    });

    doc.save('compose-project.pdf');
};

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AdmissionForm {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  isActive: boolean;
  order: number;
}

const admissionFormsPath = path.join(process.cwd(), 'data', 'admission-forms.json');

function readAdmissionForms(): AdmissionForm[] {
    try {
        const data = fs.readFileSync(admissionFormsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeAdmissionForms(forms: AdmissionForm[]): void {
    fs.writeFileSync(admissionFormsPath, JSON.stringify(forms, null, 2));
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const forms = readAdmissionForms();
        const formIndex = forms.findIndex((form: AdmissionForm) => form.id === params.id);
        
        if (formIndex === -1) {
            return NextResponse.json({ error: 'Admission form not found' }, { status: 404 });
        }

        // Toggle the active status
        forms[formIndex].isActive = !forms[formIndex].isActive;
        writeAdmissionForms(forms);

        return NextResponse.json(forms[formIndex]);
    } catch (error) {
        console.error('Error toggling admission form:', error);
        return NextResponse.json({ error: 'Failed to toggle admission form' }, { status: 500 });
    }
}

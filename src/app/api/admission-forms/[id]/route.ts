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
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const forms = readAdmissionForms();
        const formIndex = forms.findIndex((form: AdmissionForm) => form.id === params.id);
        
        if (formIndex === -1) {
            return NextResponse.json({ error: 'Admission form not found' }, { status: 404 });
        }

        const form = forms[formIndex];
        
        // Delete the physical file
        const filePath = path.join(process.cwd(), 'public', form.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Remove from data
        forms.splice(formIndex, 1);
        writeAdmissionForms(forms);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting admission form:', error);
        return NextResponse.json({ error: 'Failed to delete admission form' }, { status: 500 });
    }
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

        const body = await request.json();
        
        // Update form data
        forms[formIndex] = { ...forms[formIndex], ...body };
        writeAdmissionForms(forms);

        return NextResponse.json(forms[formIndex]);
    } catch (error) {
        console.error('Error updating admission form:', error);
        return NextResponse.json({ error: 'Failed to update admission form' }, { status: 500 });
    }
}
